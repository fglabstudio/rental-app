import { inject, Injectable } from '@angular/core';
import { BlacklistEntry } from '../model/pages/blacklist.model';
import { map, Observable } from 'rxjs';
import { HttpOperation } from './http-operation';

@Injectable({
  providedIn: 'root'
})
export class Blacklist {
  private api = inject(HttpOperation);

  getAll(): Observable<BlacklistEntry[]> {
    return this.api.get<{ [key: string]: BlacklistEntry }>('blacklist')
      .pipe(
        map(res => Object.entries(res || {}).map(([key, value]) => ({
          ...value,
          id: value.id || key
        })))
      );
  }

  getById(id: string): Observable<BlacklistEntry | null> {
    return this.api.get<BlacklistEntry>(`blacklist/${id}`);
  }

  add(entry: BlacklistEntry) {
    return this.api.post<{ name: string }>('blacklist', entry);
  }

  update(id: string, entry: Partial<BlacklistEntry>) {
    return this.api.patch<BlacklistEntry>(`blacklist/${id}`, entry);
  }

  delete(id: string) {
    return this.api.delete<void>(`blacklist/${id}`);
  }
}
