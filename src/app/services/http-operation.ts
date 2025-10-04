import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpOperation {

  private http = inject(HttpClient);
  private baseUrl = environment.api_url;

  public _showLoading = new BehaviorSubject(false);

  get<T>(path: string): Observable<T> {
    this._showLoading.next(true);

    return this.http
      .get<T>(`${this.baseUrl}/${path}.json`)
      .pipe(
        tap((result) => { this._showLoading.next(false) })
      )
  }

  post<T>(path: string, data: any): Observable<T> {
    this._showLoading.next(true);

    return this.http
      .post<T>(`${this.baseUrl}/${path}.json`, data)
      .pipe(
        tap((result) => { this._showLoading.next(false) })
      )
  }

  patch<T>(path: string, data: any): Observable<T> {
    this._showLoading.next(true);

    return this.http
      .patch<T>(`${this.baseUrl}/${path}.json`, data)
      .pipe(
        tap((result) => { this._showLoading.next(false) })
      )
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}.json`);
  }
}
