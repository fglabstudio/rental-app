import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);
    const raw = localStorage.getItem('_PTAPPUSER_');

    if (raw) {
        router.navigate(['/home']); // kalau sudah login → lempar ke home
        return false;
    } else {
        return true; // belum login → boleh akses login
    }
};
