
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = 'https://fakestoreapi.com/products';

  constructor(private http: HttpClient) {}

  getRawData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      timeout(5000),
      map(products => products.map(p => ({
        ...p,
        // We assign random dates to the mock data so the filters actually work
        date: new Date(Date.now() - Math.floor(Math.random() * 40 * 24 * 60 * 60 * 1000))
      }))),
      catchError(() => of(this.generateMockData()))
    );
  }

  private generateMockData() {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      price: Math.floor(Math.random() * 500) + 10,
      date: new Date(Date.now() - Math.floor(Math.random() * 40 * 24 * 60 * 60 * 1000))
    }));
  }
}