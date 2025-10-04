import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UnitEntry } from '../model/pages/unit.model';
import { HttpOperation } from './http-operation';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private api = inject(HttpOperation);

  getAll(): Observable<UnitEntry[]> {
    return this.api.get<{ [key: string]: UnitEntry }>('unit')
      .pipe(
        map(res => Object.entries(res || {}).map(([key, value]) => ({
          ...value,
          id: value.id || key
        })))
      );
  }

  getById(id: string): Observable<UnitEntry | null> {
    return this.api.get<UnitEntry>(`unit/${id}`);
  }

  add(entry: UnitEntry) {
    return this.api.post<{ name: string }>('unit', entry);
  }

  update(id: string, entry: Partial<UnitEntry>) {
    return this.api.patch<UnitEntry>(`unit/${id}`, entry);
  }

  delete(id: string) {
    return this.api.delete<void>(`unit/${id}`);
  }
}
