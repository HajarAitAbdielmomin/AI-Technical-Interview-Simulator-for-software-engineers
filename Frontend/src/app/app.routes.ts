import { Routes } from '@angular/router';
import {LoginPage} from './auth/login-page/login-page';
import {Dashboard} from './user/dashboard/dashboard';
import {Interview} from './user/interview/interview';
export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'user/dashboard',
    component: Dashboard
  },
  {
    path: 'user/interview',
    component: Interview
  }
];
