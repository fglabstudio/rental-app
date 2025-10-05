import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../model/pages/authentication.model';
import { Crypto } from './crypto';
import { HttpOperation } from './http-operation';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpOperation);
  private crypto = inject(Crypto);
  private _messageService = inject(MessageService);

  register(newUser: User): Observable<{ name: string }> {
    const payload: User = {
      ...newUser,
      password: this.crypto.encryptPassword(newUser.password)
    };
    return this.http.post<{ name: string }>(`/user`, payload);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.get<{ [key: string]: User }>(`/user`)
      .pipe(
        map(res => {
          if (!res) {
            this._messageService.clear();
            this._messageService.add({ severity: 'warn', summary: 'Oops', detail: 'User belum terdaftar' });
            throw new Error('User tidak terdaftar');
          };

          const user = Object.entries(res).find(([_, u]) =>
            u.email === email &&
            this.crypto.decryptPassword(u.password) === password
          );

          if (!user) {
            this._messageService.clear();
            this._messageService.add({ severity: 'warn', summary: 'Oops', detail: 'Periksa email atau password Anda' });
            throw new Error('Periksa email atau password Anda');
          }

          const [key, value] = user;
          localStorage.setItem("_PTAPPUSER_", JSON.stringify({ ...value, id: key }));
          return { ...value, id: key };
        })
      );
  }

  updateLastLogin(id: string): Observable<Partial<User>> {
    const update = { last_login: new Date().toISOString() };
    return this.http.patch<Partial<User>>(`/user/${id}`, update);
  }

  updateUser(id: string, updated: Partial<User>): Observable<User> {
    // encrypt password sebelum simpan
    const payload: Partial<User> = {
      ...updated,
      ...(updated.password ? { password: this.crypto.encryptPassword(updated.password) } : {})
    };

    return this.http.patch<User>(`/user/${id}`, payload).pipe(
      map(res => {
        // update localStorage setelah berhasil
        const raw = localStorage.getItem('_PTAPPUSER_');
        if (raw) {
          const current = JSON.parse(raw);
          const newUser = { ...current, ...payload };
          localStorage.setItem('_PTAPPUSER_', JSON.stringify(newUser));
        }
        this._messageService.clear();
        this._messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui' });
        return res;
      })
    );
  }

  getProfile() {
    return JSON.parse(localStorage.getItem("_PTAPPUSER_") as any) as User;
  }

  getAllUser(forceRefresh = false): Observable<User[]> {
    return this.http.get<{ [key: string]: User }>('user').pipe(
      map(res =>
        Object.entries(res || {}).map(([key, value]) => ({
          ...value,
          id: value.id || key
        }))
      )
    );
  }
}
