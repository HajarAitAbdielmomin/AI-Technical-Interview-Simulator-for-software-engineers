import { Routes } from '@angular/router';
import {LoginPage} from './auth/login-page/login-page';
import {Dashboard} from './user/dashboard/dashboard';
import {InterviewSetup} from './user/interviewSetup/interviewSetup';
import {Interview} from './user/interview/interview';
import {Layout} from './user/layout/layout';
import {InterviewsData} from './user/interviews-data/interviews-data';
import {authGuard, guestGuard} from './guards/auth.guard';
export const routes: Routes = [
  // ── Guest only (redirect to dashboard if already logged in) ──
  { path: '',           component: LoginPage, canActivate: [guestGuard] },
  { path: 'auth/login', component: LoginPage, canActivate: [guestGuard] },

  // ── Protected layout shell ──
  {
    path: 'user',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',  component: Dashboard },
      { path: 'interviews', component: InterviewsData },
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ── Protected full-screen routes ──
  { path: 'user/interview/setup',      component: InterviewSetup, canActivate: [authGuard] },
  { path: 'user/interview/:id',        component: Interview,      canActivate: [authGuard] },
  { path: 'user/interview/:id/resume', component: Interview,      canActivate: [authGuard] },

  // ── Fallback ──
  { path: '**', redirectTo: 'auth/login' },
];
