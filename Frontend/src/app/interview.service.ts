import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment.development';
import {ApiInterview} from './user/interviews-data/interviews-data';

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

  getResumeData(interviewId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/interviews/${interviewId}/resume`);
  }
  getUserInterviews(userId: string): Observable<any[]> {
    return this.http.get<ApiInterview[]>(`${environment.apiUrl}/interviews/user/${userId}/all`);
  }

  deleteInterview(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/interviews/${id}/delete`, { responseType: 'text' });
  }

  getInterviewById(id: string): Observable<any> {
    const url = `${environment.apiUrl}/interviews/${id}`;
    return this.http.get(url, httpOptions);
  }

  createInterview(data: any): Observable<any> {
    const url = `${environment.apiUrl}/interviews/start`;
    return this.http.post(url, data, httpOptions);
  }

  generateQuestion(interviewId: string): Observable<any> {
    const url = `${environment.apiUrl}/interviews/${interviewId}/next-question`;
    return this.http.get(url, httpOptions);
  }
  submitAnswer(data:any): Observable<any> {
    const url = `${environment.apiUrl}/interviews/answer`;
    return this.http.post(url, data , httpOptions);
  }

  endInterview(interviewId: number | string): Observable<String> {
    const url = `${environment.apiUrl}/interviews/${interviewId}/end`;
    return this.http.get(
      url,
      { responseType: 'text' }
    );
  }
  getFeedback(id: number | string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/feedbacks/${id}/feedback`, httpOptions);
  }
}
