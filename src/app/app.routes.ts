import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: async () => (await import('./pages/login/login')).Login,
        data: {
            title: 'Login'
        }
    },
    {
        path: 'home',
        loadComponent: async () => (await import('./pages/home/home')).Home,
        data: {
            title: 'Home'
        }
    }
];
