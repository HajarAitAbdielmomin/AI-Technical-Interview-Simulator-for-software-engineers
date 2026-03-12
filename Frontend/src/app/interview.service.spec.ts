import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InterviewService } from './interview.service';
import { environment } from '../environments/environment.development';

describe('InterviewService', () => {
  let service: InterviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InterviewService],
    });

    service = TestBed.inject(InterviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });


  it('should GET interview by id with JSON headers', () => {
    const interviewId = 'abc';
    const mockResponse = { id: interviewId };

    service.getInterviewById(interviewId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/interviews/${interviewId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(mockResponse);
  });

  it('should POST to start an interview with provided payload and JSON headers', () => {
    const payload = { role: 'frontend', difficulty: 'mid' };
    const mockResponse = { id: 'new-interview' };

    service.createInterview(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/interviews/start`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should GET next question for an interview with JSON headers', () => {
    const interviewId = 'int-1';
    const mockResponse = { question: 'What is RxJS?' };

    service.generateQuestion(interviewId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/interviews/${interviewId}/next-question`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(mockResponse);
  });

  it('should POST answer with payload and JSON headers', () => {
    const payload = { interviewId: 'int-1', answer: 'Explanation...' };
    const mockResponse = { status: 'recorded' };

    service.submitAnswer(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/interviews/answer`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should GET to end an interview and expect text responseType', () => {
    const interviewId = 42; // works with number or string
    const mockResponseText = 'Interview ended';

    service.endInterview(interviewId).subscribe((res) => {
      expect(res).toBe(mockResponseText);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/interviews/${interviewId}/end`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush(mockResponseText);
  });

  it('should GET feedback for an interview with JSON headers', () => {
    const interviewId = 'int-1';
    const mockResponse = { feedback: 'Great job!' };

    service.getFeedback(interviewId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/feedbacks/${interviewId}/feedback`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(mockResponse);
  });

});
