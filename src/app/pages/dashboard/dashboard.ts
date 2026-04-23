import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { NgApexchartsModule } from "ng-apexcharts";
import ApexCharts from 'apexcharts';

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
  isLoading = true;

  // ✅ Date properties fixed
  startDate: string = '';
  endDate: string = '';

  public revenueChart: any;
  public visitsChart: any;

  private resizeTimeout: any;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.loadData();
  }

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.refreshCharts();
    }, 200);
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
        case 'this-month': return itemTime >= (todayStart - (30 * oneDay));
        case 'custom':
          if (!this.startDate || !this.endDate) return true;
          const start = new Date(this.startDate).getTime();
          const end = new Date(this.endDate).getTime() + (oneDay - 1);
          return itemTime >= start && itemTime <= end;
        default: return true;
      }
    });

    this.calculateMetrics(filtered);
  }

  calculateMetrics(data: any[]) {
    const revenue = data.reduce((acc, curr) => acc + curr.price, 0);
    
    // ✅ RE-ADDED the fourth card here
    this.displayStats = [
      { title: 'Total Revenue', value: '$' + revenue.toFixed(0), icon: 'bx bx-dollar', color: 'orders-bg' },
      { title: 'Daily Revenue', value: '$' + (revenue / 30).toFixed(0), icon: 'bx bx-trending-up', color: 'trans-bg' },
      { title: 'Items Sold', value: data.length, icon: 'bx bx-cart', color: 'items-bg' },
      { title: 'Active Users', value: Math.floor(data.length * 1.5), icon: 'bx bx-user', color: 'users-bg' }
    ];

    this.initCharts(data);
  }

  private initCharts(data: any[]) {
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lastSevenDays = sorted.slice(-7);

    const commonChartSettings = {
      width: '100%',
      height: 300,
      animations: { enabled: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    };

    this.revenueChart = {
      series: [{ name: "Revenue", data: lastSevenDays.map(i => i.price) }],
      chart: { id: "revenueChart", ...commonChartSettings, type: "area", toolbar: { show: false } },
      colors: ["#4F46E5"],
      stroke: { curve: "smooth", width: 3 },
      xaxis: { 
        categories: lastSevenDays.map(i => new Date(i.date).toLocaleDateString('en-US', { weekday: 'short' })) 
      }
    };

    const visitsByDate: { [key: string]: number } = {};
    data.forEach(item => {
      const label = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
      visitsByDate[label] = (visitsByDate[label] || 0) + 1;
    });

    this.visitsChart = {
      series: [{ name: "Visits", data: Object.values(visitsByDate) }],
      chart: { id: "visitsChart", ...commonChartSettings, type: "bar", toolbar: { show: false } },
      colors: ["#8B5CF6"],
      plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
      xaxis: { categories: Object.keys(visitsByDate) }
    };
  }

  private refreshCharts() {
    ApexCharts.exec("revenueChart", "updateOptions", {});
    ApexCharts.exec("visitsChart", "updateOptions", {});
  }

  public triggerResize() {
    setTimeout(() => { this.refreshCharts(); }, 500);
  }
}