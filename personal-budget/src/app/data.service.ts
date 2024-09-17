import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/budget';
  private dataSubject = new BehaviorSubject<any>(null);
  private data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) { }

  fetchData(): void {
    if (!this.dataSubject.getValue()) {
      this.http.get(this.apiUrl).pipe(
        tap(data => this.dataSubject.next(data))
      ).subscribe();
    }
  }

  getData(): Observable<any> {
    return this.data$;
  }
}
