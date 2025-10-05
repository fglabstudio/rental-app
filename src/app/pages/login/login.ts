import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { ButtonModule } from 'primeng/button'
import { LoginService } from '../../services/login';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login implements OnDestroy {

  Destroy$ = new Subject();

  Form: FormGroup;

  _showRegister = false;

  constructor(
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _messageService: MessageService,
  ) {
    this.Form = this._formBuilder.group({
      full_name: ['', []],
      nama_instansi: ['', []],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirm_password: ['', []],
    });
  }

  toggleRegisterForm() {
    this._showRegister = !this._showRegister;

    const fullNameControl = this.Form.get('full_name');
    const instansiControl = this.Form.get('nama_instansi');

    if (this._showRegister) {
      fullNameControl?.setValidators([Validators.required]);
      instansiControl?.setValidators([Validators.required]);
    } else {
      fullNameControl?.clearValidators();
      instansiControl?.clearValidators();
    }

    fullNameControl?.updateValueAndValidity();
    instansiControl?.updateValueAndValidity();
  }

  handleLogin(data: any) {
    if (this.Form.valid) {
      this._loginService
        .login(data.email, data.password)
        .pipe(takeUntil(this.Destroy$))
        .subscribe((result) => {
          if (result.id) {
            this._messageService.clear();
            this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Log in berhasil' });
            setTimeout(() => {
              this._router.navigateByUrl("/home");
            }, 2500);
          }
        })
    } else {
      this._messageService.clear();
      this._messageService.add({ severity: 'error', summary: 'Oops', detail: 'Periksa data Anda' })
    }
  }

  handleRegister(data: any) {
    if (data.password === data.confirm_password && this.Form.valid) {
      const { confirm_password, ...payload } = data;

      this._loginService
        .register(payload)
        .pipe(takeUntil(this.Destroy$))
        .subscribe((result) => {
          if (result.name) {
            this._messageService.clear();
            this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Register berhasil' });
            this.toggleRegisterForm();
          }
        });

    } else {
      this._messageService.clear();
      this._messageService.add({ severity: 'error', summary: 'Oops', detail: 'Password tidak sesuai' })
    }
  }

  ngOnDestroy(): void {
    this.Destroy$.next(0);
    this.Destroy$.complete();
  }
}
