import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { LoginService } from '../../services/login';
import { User } from '../../model/pages/authentication.model';
import { Layout } from '../../components/layout/layout';
import { Crypto } from '../../services/crypto';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    Layout
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  standalone: true,
})
export class Profile {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private crypto = inject(Crypto);
  private loginService = inject(LoginService);
  private messageService = inject(MessageService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', Validators.required],
    nama_instansi: ['', Validators.required],
    password: ['', Validators.required]
  });

  private userId: string | null = null;

  constructor() {
    this.loadProfile();
  }

  loadProfile() {
    const raw = localStorage.getItem('_PTAPPUSER_');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        this.userId = user.id;
        this.form.patchValue({
          email: user.email,
          full_name: user.full_name,
          nama_instansi: user.nama_instansi,
          password: this.crypto.decryptPassword(user.password)
        });
      } catch (err) {
        console.error('Invalid profile data in localStorage');
      }
    }
  }

  saveProfile() {
    if (this.form.valid && this.userId) {
      this.loginService.updateUser(this.userId, this.form.value as User).subscribe({
        next: () => {
          // localStorage sudah diupdate di service
        },
        error: err => {
          console.error('Update gagal', err);
        }
      });
    }
  }

  logout() {
    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Log Out Berhasil' });
    setTimeout(() => {
      localStorage.clear();
      this.router.navigateByUrl("");
    }, 1000);
  }
}