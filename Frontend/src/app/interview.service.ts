import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment.development';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class InterviewService {

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<any> {
    const url = `${environment.apiUrl}/interviews`;
    return this.http.get(url, httpOptions);
  }

  getInterviewById(id: string): Observable<any> {
    const url = `${environment.apiUrl}/interviews/${id}`;
    return this.http.get(url, httpOptions);
  }

  createInterview(data: any): Observable<any> {
    const url = `${environment.apiUrl}/interviews/start`;
    return this.http.post(url, data, httpOptions);
  }


  submitAnswer(interviewId: string, questionId: string, answer: any): Observable<any> {
    const url = `${environment.apiUrl}/interviews/${interviewId}/answers`;
    return this.http.post(url, { questionId, answer }, httpOptions);
  }
}
