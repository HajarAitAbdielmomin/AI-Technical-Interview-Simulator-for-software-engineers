import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { StorageService } from '../../storage.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  userInfo: any = null;
  userInitial = '';

  pageTitle    = 'Dashboard';
  pageSubtitle = 'Track your interview performance';
  showLogoutDialog = false;

  // Map route segments to title/subtitle
  private readonly pageMeta: Record<string, { title: string; subtitle: string }> = {
    'dashboard':   { title: 'Dashboard',   subtitle: 'Track your interview performance' },
    'interviews':  { title: 'Interviews',  subtitle: 'Browse your past sessions'        },
  };

  constructor(
    private router:         Router,
    private storageService: StorageService,
    private authService:    AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo    = this.storageService.getUser();
    this.userInitial = this.userInfo?.username?.charAt(0).toUpperCase() ?? 'U';

    // Set title on first load
    this.updateMeta(this.router.url);

    // Update title on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateMeta(e.urlAfterRedirects));
  }

  private updateMeta(url: string): void {
    const segment = url.split('/').filter(Boolean).pop() ?? '';
    const meta    = this.pageMeta[segment];
    if (meta) {
      this.pageTitle    = meta.title;
      this.pageSubtitle = meta.subtitle;
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
