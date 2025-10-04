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
    },
    {
        path: 'blacklist',
        loadComponent: async () => (await import('./pages/blacklist/blacklist')).Blacklist,
        data: {
            title: 'Customer Blacklist'
        }
    }
];
