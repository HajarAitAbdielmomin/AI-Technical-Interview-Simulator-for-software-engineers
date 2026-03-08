import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {StorageService} from './storage.service';
import {environment} from '../environments/environment.development';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  constructor(private http: HttpClient, private storageService: StorageService) {}

  authenticateUser(email: any, password: any): Observable<any> {
    const url = `${environment.apiUrl}/users/auth/signin`;
    return this.http.post(url, { email, password }, httpOptions);
  }
  createUser(username: any,email: any, password: any):Observable<any> {
    const url = `${environment.apiUrl}/users/auth/signup`;
    return this.http.post(url, { username, email, password }, { ...httpOptions, responseType: 'text' });
  }

  logout():Observable<any>{
    const url = `${environment.apiUrl}/auth/logout`;
    return this.http.post(url, {}).pipe(
      tap(() => {
        this.storageService.logout();
        this.storageService.clean();
      })
    );
  }
}
