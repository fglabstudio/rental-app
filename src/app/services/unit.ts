import { inject, Injectable } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { UnitEntry } from '../model/pages/unit.model';
import { HttpOperation } from './http-operation';
import { LoginService } from './login';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private api = inject(HttpOperation);
  private loginService = inject(LoginService);

  private cache$?: Observable<UnitEntry[]>; // cache observable

  getAll(forceRefresh = false): Observable<UnitEntry[]> {
    if (!this.cache$ || forceRefresh) {
      const user = this.loginService.getProfile();

      this.cache$ = this.api.get<{ [key: string]: UnitEntry }>('unit').pipe(
        map(res => {
          const data = Object.entries(res || {}).map(([key, value]) => ({
            ...value,
            id: value.id || key
          }));

          // Admin → semua data
          if (user.id === '-Oaj8uPRFWSzOmqKQbvO' || user.email === 'admin@gmail.com') {
            return data;
          }

          // Non-admin → filter berdasarkan user
          return data.filter(unit => unit.user_entry === user.id);
        }),
        shareReplay(1) // simpan hasil terakhir untuk subscriber berikutnya
      );
    }

    return this.cache$;
  }

  getById(id: string): Observable<UnitEntry | null> {
    if (this.cache$) {
      return this.cache$.pipe(
        map(units => units.find(u => u.id === id) || null)
      );
    }
    return this.api.get<UnitEntry>(`unit/${id}`);
  }

  add(entry: UnitEntry) {
    return this.api.post<{ name: string }>('unit', entry).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: string, entry: Partial<UnitEntry>) {
    return this.api.patch<UnitEntry>(`unit/${id}`, entry).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: string) {
    return this.api.delete<void>(`unit/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache() {
    this.cache$ = undefined; // buang cache, getAll() fetch ulang
  }
}
