import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  storeToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    } catch {
      return null;
    }
  }

  storeUser(user: any) {
    if (this.isBrowser()) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    if (!this.isBrowser()) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  clean(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    }
  }
}
