import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private http: HttpClient) {}
  getLastThreeUserInterviews(id: string): Observable<any> {
    const url = `${environment.apiUrl}/interviews/user/${id}`;
    return this.http.get(url);
  }
  getUserStatistics(id: string): Observable<any> {
    const url = `${environment.apiUrl}/feedbacks/user/${id}/statistics`;
    return this.http.get(url);
  }
}
