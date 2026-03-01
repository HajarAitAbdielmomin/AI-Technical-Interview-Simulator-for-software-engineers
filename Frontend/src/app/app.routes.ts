import { Routes } from '@angular/router';
import {LoginPage} from './auth/login-page/login-page';
import {Dashboard} from './users/admin/dashboard/dashboard';
import {Dashboard as DashboardPO} from './users/product-owner/dashboard/dashboard';
import {Dashboard as DashboardPM} from './users/project-manager/dashboard/dashboard';
import {Dashboard as DashboardTM} from './users/team-member/dashboard/dashboard';
export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'admin/dashboard',
    component: Dashboard
  },
  {
    path: 'product-owner/dashboard',
    component: DashboardPO
  },
  {
    path: 'project-manager/dashboard',
    component: DashboardPM
  },
  {
    path: 'team-member/dashboard',
    component: DashboardTM
  },

];
