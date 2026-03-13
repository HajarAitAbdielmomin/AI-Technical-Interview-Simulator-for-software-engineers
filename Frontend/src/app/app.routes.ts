import { Routes } from '@angular/router';
import {LoginPage} from './auth/login-page/login-page';
import {Dashboard} from './user/dashboard/dashboard';
import {InterviewSetup} from './user/interviewSetup/interviewSetup';
import {Interview} from './user/interview/interview';
import {Layout} from './user/layout/layout';
import {InterviewsData} from './user/interviews-data/interviews-data';
export const routes: Routes = [
  { path: '',         component: LoginPage },
  { path: 'auth/login', component: LoginPage },

  // ── Layout shell (sidebar + topbar) ──
  {
    path: 'user',
    component: Layout,
    children: [
      { path: 'dashboard',  component: Dashboard },
      { path: 'interviews', component: InterviewsData },
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ── Full-screen (no layout) ──
  { path: 'user/interview/setup', component: InterviewSetup },
  { path: 'user/interview/:id',   component: Interview },
  { path: 'user/interview/:id/resume', component: Interview },
];
