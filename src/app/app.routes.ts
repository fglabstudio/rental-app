import { Routes } from '@angular/router';
import { guestGuard } from './utility/guest.guard';
import { authGuard } from './utility/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: async () => (await import('./pages/login/login')).Login,
        data: {
            title: 'Login'
        },
        canActivate: [guestGuard]
    },
    {
        path: 'home',
        loadComponent: async () => (await import('./pages/home/home')).Home,
        data: {
            title: 'Home'
        },
        canActivate: [authGuard]
    },
    {
        path: 'blacklist',
        loadComponent: async () => (await import('./pages/blacklist/blacklist')).Blacklist,
        data: {
            title: 'Customer Blacklist'
        },
        canActivate: [authGuard]
    },
    {
        path: 'unit',
        loadComponent: async () => (await import('./pages/unit/unit')).Unit,
        data: {
            title: 'Unit'
        },
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: async () => (await import('./pages/profile/profile')).Profile,
        data: {
            title: 'Profile'
        },
        canActivate: [authGuard]
    }
];
