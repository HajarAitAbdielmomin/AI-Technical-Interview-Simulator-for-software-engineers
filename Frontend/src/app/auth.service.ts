import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

const baseUrl = 'http://localhost:8989/api';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  constructor(private http: HttpClient) {}

  authenticateUser(email: any, password: any): Observable<any> {
    const url = `${baseUrl}/auth/signin`;
    return this.http.post(url, { email, password }, httpOptions);
  }
}
