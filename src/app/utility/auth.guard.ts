import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const raw = localStorage.getItem('_PTAPPUSER_');

    if (raw) {
        return true; // sudah login → boleh akses home
    } else {
        router.navigate(['']); // kalau belum login → balik ke login ('')
        return false;
    }
};
