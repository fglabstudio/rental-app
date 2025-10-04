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
            this._messageService.add({ severity: 'warn', detail: 'Oops', summary: 'User belum terdaftar' });
            throw new Error('User tidak terdaftar');
          };

          const user = Object.entries(res).find(([_, u]) =>
            u.email === email &&
            this.crypto.decryptPassword(u.password) === password
          );

          if (!user) {
            this._messageService.clear();
            this._messageService.add({ severity: 'warn', detail: 'Oops', summary: 'Periksa email atau password Anda' });
            throw new Error('Periksa email atau password Anda');
          }

          const [key, value] = user;
          localStorage.setItem("_PTAPPUSER_", JSON.stringify(value));
          return { ...value, id: key };
        })
      );
  }

  updateLastLogin(id: string): Observable<Partial<User>> {
    const update = { last_login: new Date().toISOString() };
    return this.http.patch<Partial<User>>(`/user/${id}`, update);
  }
}
