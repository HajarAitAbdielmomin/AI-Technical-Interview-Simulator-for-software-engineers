import { Routes } from '@angular/router';
import {LoginPage} from './auth/login-page/login-page';
import {Dashboard} from './user/dashboard/dashboard';
export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'user/dashboard',
    component: Dashboard
  }
];
