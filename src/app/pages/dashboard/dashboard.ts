
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AnalyticsService } from '../../services/analytics.service';
import { NgApexchartsModule } from "ng-apexcharts";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  rawOrders: any[] = [];
  displayStats: any[] = [];
  selectedFilter: string = 'this-month';
  startDate: string = '';
  endDate: string = '';
  isLoading = true;

  // Chart Properties ---
  public revenueChart: any;
  public visitsChart: any;

  

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.analyticsService.getRawData().subscribe(data => {
      this.rawOrders = data;
      this.applyFilter();
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  applyFilter() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    const filtered = this.rawOrders.filter(item => {
      const itemTime = new Date(item.date).getTime();

      switch (this.selectedFilter) {
        case 'today': return itemTime >= todayStart;
        case 'yesterday': return itemTime >= (todayStart - oneDay) && itemTime < todayStart;
        case 'this-week': return itemTime >= (todayStart - (7 * oneDay));
        case 'last-week': return itemTime >= (todayStart - (14 * oneDay)) && itemTime < (todayStart - (7 * oneDay));
        case 'this-month': return itemTime >= (todayStart - (30 * oneDay));
        case 'last-month': return itemTime >= (todayStart - (60 * oneDay)) && itemTime < (todayStart - (30 * oneDay));
        case 'custom':
          if (!this.startDate || !this.endDate) return true;
          return itemTime >= new Date(this.startDate).getTime() && itemTime <= new Date(this.endDate).getTime();
        default: return true;
      }
    });

    this.calculateMetrics(filtered);
  }

  calculateMetrics(data: any[]) {
    const revenue = data.reduce((acc, curr) => acc + curr.price, 0);
    this.displayStats = [
      { title: 'Total Revenue', value: '$' + revenue.toFixed(0), icon: 'bx bx-dollar', color: 'orders-bg' },
      { title: 'Daily Revenue', value: '$' + (revenue / 30).toFixed(0), icon: 'bx bx-trending-up', color: 'trans-bg' },
      { title: 'Items Sold', value: data.length, icon: 'bx bx-cart', color: 'items-bg' },
      { title: 'Active Users', value: Math.floor(data.length * 1.5), icon: 'bx bx-user', color: 'users-bg' }
    ];

    // Call Chart Init //
    this.initCharts(data);
  }

  // New Chart Setup Method //
private initCharts(data: any[]) {
  // Sort the data by date
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  //  Take only the last 7 entries for one week of data
  const lastSevenDays = sorted.slice(-7);

  this.revenueChart = {
    series: [{ 
      name: "Revenue", 
      data: lastSevenDays.map(i => i.price) 
    }],
    chart: { 
      type: "area", 
      height: 300,    
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ["#4F46E5"],
    stroke: { curve: "smooth", width: 3 },
    xaxis: { 
      // Mapping the dates to weekday names 
      categories: lastSevenDays.map(i => 
        new Date(i.date).toLocaleDateString('en-US', { weekday: 'short' })
      ) 
    },
   yaxis: {
  min: 0,
  max: 100,
  tickAmount: 5, 
  labels: {
    formatter: (value: number) => {
      if (value === 0) return '0';
      if (value === 20) return '$20k';
      if (value === 50) return '$50k';
      if (value === 70) return '$70k';
      if (value === 100) return '$100k';
      
      return ''; 
    }
  }
}
  };

//  VISITS CHART: Updated to be dynamic and use an automatic scale
//  Group the filtered data by date to get "Daily Visits"
    const visitsByDate: { [key: string]: number } = {};
    
    data.forEach(item => {
      // Create a key like "Mon" or "Mon 12"
      const label = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
      visitsByDate[label] = (visitsByDate[label] || 0) + 1;
    });

    const labels = Object.keys(visitsByDate);
    const counts = Object.values(visitsByDate);

    this.visitsChart = {
      series: [{ 
        name: "Visits", 
        data: counts 
      }],
      chart: { 
        type: "bar", 
        height: 300, 
        toolbar: { show: false },
        redrawOnParentResize: true
      },
      dataLabels: {
        enabled: false
      },
      colors: ["#8B5CF6"],
      plotOptions: { 
        bar: { 
          borderRadius: 8, 
          columnWidth: '55%',
          distributed: false 
        } 
      },
      legend: {
        show: false 
      },
      xaxis: { 
        categories: labels,
        labels: { 
          show: true,
          style: { colors: '#64748b', fontSize: '12px' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        show: false,
        labels: { show: false }
      },
      grid: {
        show: false
      },
      tooltip: {
        enabled: true,
        y: { 
          formatter: () => '', 
          title: { formatter: () => 'Visitors' } 
        }
      }
    };

  }

}

