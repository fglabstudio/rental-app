import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UnitEntry } from '../model/pages/unit.model';
import { HttpOperation } from './http-operation';
import { LoginService } from './login';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private api = inject(HttpOperation);
  private loginService = inject(LoginService);

  getAll(): Observable<UnitEntry[]> {
    const user = this.loginService.getProfile();

    return this.api.get<{ [key: string]: UnitEntry }>('unit')
      .pipe(
        map(res => {
          const data = Object.entries(res || {}).map(([key, value]) => ({
            ...value,
            id: value.id || key
          }));

          // Jika admin → semua data
          if (user.id === '-Oaj8uPRFWSzOmqKQbvO' || user.email === 'admin@gmail.com') {
            return data;
          }

          // Jika bukan admin → filter hanya data sesuai user
          return data.filter(unit => unit.user_entry === user.id);
        })
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
