import { inject, Injectable } from '@angular/core';
import { Observable, from, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { UnitEntry } from '../model/pages/unit.model';
import { HttpOperation } from './http-operation';
import { LoginService } from './login';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private api = inject(HttpOperation);
  private loginService = inject(LoginService);

  private cache$?: Observable<UnitEntry[]>;

  private supabase: SupabaseClient;
  private readonly BUCKET = 'pandora-app';

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

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

  add(entry: UnitEntry, file?: File) {
    const payload = { ...entry };
    delete (payload as any).id;

    return this.api.post<{ name: string }>('unit', payload).pipe(
      switchMap(res => {
        const id = res.name;
        if (!file) {
          this.invalidateCache();
          return of({ id });
        }
        return this.uploadStnk(file, id).pipe(
          switchMap(({ url, path }) =>
            this.api.patch<UnitEntry>(`unit/${id}`, { keterangan: url, stnk_path: path }).pipe(
              tap(() => this.invalidateCache()),
              map(() => ({ id, url, path }))
            )
          )
        );
      })
    );
  }

  /** compress + upload STNK to Supabase */
  private uploadStnk(file: File, unitId: string): Observable<{ url: string; path: string }> {
    const options = { maxSizeMB: 0.6, maxWidthOrHeight: 1280, useWebWorker: true };

    return from(imageCompression(file, options)).pipe(
      switchMap((compressed: Blob | File) => {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const filePath = `stnk/${unitId}.${ext}`;
        const toUpload = compressed instanceof File
          ? compressed
          : new File([compressed], `upload.${ext}`, { type: file.type || 'image/jpeg' });

        return from(
          this.supabase.storage.from(this.BUCKET).upload(filePath, toUpload, {
            upsert: true,
            contentType: file.type || 'image/jpeg'
          })
        ).pipe(
          switchMap(res => {
            if (res.error) return throwError(() => res.error);
            const { data } = this.supabase.storage.from(this.BUCKET).getPublicUrl(filePath);
            return of({ url: (data as any).publicUrl, path: filePath });
          })
        );
      })
    );
  }

  private removeStnk(path: string): Observable<void> {
    return from(this.supabase.storage.from(this.BUCKET).remove([path])).pipe(
      switchMap(res => {
        if (res.error) return throwError(() => res.error);
        return of(void 0);
      })
    );
  }

  update(id: string, entry: Partial<UnitEntry>, file?: File, oldFilePath?: string) {
    return this.api.patch<UnitEntry>(`unit/${id}`, entry).pipe(
      switchMap(updated => {
        if (!file) {
          this.invalidateCache();
          return of(updated);
        }

        const remove$ = oldFilePath ? this.removeStnk(oldFilePath) : of(void 0);

        return remove$.pipe(
          switchMap(() => this.uploadStnk(file, id)),
          switchMap(({ url, path }) =>
            this.api.patch<UnitEntry>(`unit/${id}`, { keterangan: url, stnk_path: path }).pipe(
              tap(() => this.invalidateCache())
            )
          )
        );
      })
    );
  }

  delete(id: string, filePath?: string) {
    const remove$ = filePath ? this.removeStnk(filePath) : of(void 0);

    return remove$.pipe(
      switchMap(() =>
        this.api.delete<void>(`unit/${id}`).pipe(tap(() => this.invalidateCache()))
      )
    );
  }

  private invalidateCache() {
    this.cache$ = undefined; // buang cache, getAll() fetch ulang
  }
}
