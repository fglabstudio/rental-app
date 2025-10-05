import { inject, Injectable } from '@angular/core';
import { BlacklistEntry } from '../model/pages/blacklist.model';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { HttpOperation } from './http-operation';

@Injectable({
  providedIn: 'root'
})
export class BlacklistService {
  private api = inject(HttpOperation);

  private cache$?: Observable<BlacklistEntry[]>;

  getAll(forceRefresh = false): Observable<BlacklistEntry[]> {
    if (!this.cache$ || forceRefresh) {
      this.cache$ = this.api.get<{ [key: string]: BlacklistEntry }>('blacklist').pipe(
        map(res =>
          Object.entries(res || {}).map(([key, value]) => ({
            ...value,
            id: value.id || key
          }))
        ),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  getById(id: string): Observable<BlacklistEntry | null> {
    if (this.cache$) {
      return this.cache$.pipe(
        map(entries => entries.find(e => e.id === id) || null)
      );
    }
    return this.api.get<BlacklistEntry>(`blacklist/${id}`);
  }

  add(entry: BlacklistEntry) {
    return this.api.post<{ name: string }>('blacklist', entry).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: string, entry: Partial<BlacklistEntry>) {
    return this.api.patch<BlacklistEntry>(`blacklist/${id}`, entry).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: string) {
    return this.api.delete<void>(`blacklist/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache() {
    this.cache$ = undefined; // buang cache, getAll() fetch ulang
  }
}
