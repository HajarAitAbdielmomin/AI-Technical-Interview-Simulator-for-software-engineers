import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../storage.service';
import { InterviewService } from '../../interview.service';

export type InterviewerType = 'FAANG_STRICT' | 'STARTUP_FRIENDLY' | 'HR_BEHAVIORAL' | 'JUNIOR_FRIENDLY';

// Raw shape returned by the API
export interface ApiFeedback {
  score:                number;
  strengths:            string;
  weaknesses:           string;
  improvement_suggestions: string;
}

export interface ApiInterview {
  id:              number;
  techStack:       string;
  interviewerType: InterviewerType;
  level:           string;
  status:          'IN_PROGRESS' | 'COMPLETED';
  startTime:       string;
  endTime:         string | null;
  feedback:        ApiFeedback | null;
  questionAnswer:  { question: string; userAnswer: string; interviewId: null }[];
}
// Mapped shape used by the template (includes parsed data for drawer)
export interface InterviewRow {
  id:              number;
  interviewerType: InterviewerType;
  techStack:       string;
  level:           string;
  status:          'IN_PROGRESS' | 'COMPLETED';
  startTime:       string;
  endTime:         string | null;
  score:           number | null;
  strengths:       string[];
  weaknesses:      string[];
  improvements:    string[];
  questionAnswer:  { question: string; userAnswer: string }[];
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe],
  templateUrl: './interviews-data.html',
  styleUrl: './interviews-data.css'
})
export class InterviewsData implements OnInit {

  all:      InterviewRow[] = [];
  filtered: InterviewRow[] = [];
  paged:    InterviewRow[] = [];

  isLoading = true;
  userInfo: any;

  // ── Filters ──
  filterStack     = '';
  filterLevel     = '';
  filterMinScore: number | null = null;
  filterStatus    = '';

  readonly levels = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];

  get hasActiveFilters(): boolean {
    return !!(this.filterStack || this.filterLevel || this.filterMinScore || this.filterStatus);
  }

  // ── Pagination ──
  readonly pageSize = 5;
  currentPage = 1;
  totalPages  = 1;

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3)         pages.push(-1);
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
      if (cur < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  // Gauge arc dash — total arc length ≈ 172.8 (half-circle r=55)
  getGaugeDash(score: number | null): string {
    if (score == null) return '0 172.8';
    const filled = (score / 100) * 172.8;
    return `${filled} 172.8`;
  }

  // ── Delete dialog ──
  deleteTarget: InterviewRow | null = null;
  isDeleting = false;

  // ── Personas ──
  private readonly personas: Record<InterviewerType, { name: string; initials: string; role: string }> = {
    FAANG_STRICT:     { name: 'Dr. Marcus Reid', initials: 'MR', role: 'Senior Staff · FAANG'   },
    STARTUP_FRIENDLY: { name: 'Sofia Chen',      initials: 'SC', role: 'CTO · Startup'          },
    HR_BEHAVIORAL:    { name: 'James Okafor',    initials: 'JO', role: 'Head of Talent · Tech'  },
    JUNIOR_FRIENDLY:  { name: 'Priya Nair',      initials: 'PN', role: 'Lead Engineer · Mentor' }
  };

  getInterviewerName(t: InterviewerType):     string { return this.personas[t]?.name     ?? t; }
  getInterviewerInitials(t: InterviewerType): string { return this.personas[t]?.initials  ?? '?'; }
  getInterviewerRole(t: InterviewerType):     string { return this.personas[t]?.role      ?? ''; }

  getScoreColor(score: number | undefined | null): string {
    if (score == null) return '#999';
    if (score >= 80) return '#00ff00';
    if (score >= 60) return '#ffff00';
    return '#FF0000';
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  constructor(
    private router:           Router,
    private storageService:   StorageService,
    private interviewService: InterviewService,
    private cdr:              ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.storageService.getToken();
    if (!token) { setTimeout(() => this.router.navigate(['/auth/login']), 0); return; }
    this.userInfo = this.storageService.getUser();
    this.loadInterviews();
  }

  private loadInterviews(): void {
    this.isLoading = true;
    this.interviewService.getUserInterviews(this.userInfo.id).subscribe({
      next: (res: any[]) => {
        this.all = (res as ApiInterview[])
          .map(iv => ({
            id:              iv.id,
            interviewerType: iv.interviewerType ?? 'FAANG_STRICT' as InterviewerType,
            techStack:       iv.techStack ?? '',
            level:           iv.level ?? '',
            status:          iv.status,
            startTime:       iv.startTime,
            endTime:         iv.endTime ?? null,
            score:           iv.feedback?.score != null ? Math.round(iv.feedback.score) : null,
            strengths:       iv.feedback?.strengths    ? iv.feedback.strengths.split('||').map(s => s.trim()).filter(Boolean)    : [],
            weaknesses:      iv.feedback?.weaknesses   ? iv.feedback.weaknesses.split('||').map(s => s.trim()).filter(Boolean)   : [],
            improvements:    iv.feedback?.improvement_suggestions ? iv.feedback.improvement_suggestions.split('||').map(s => s.trim()).filter(Boolean) : [],
            questionAnswer:  (iv.questionAnswer ?? []).map(qa => ({ question: qa.question, userAnswer: qa.userAnswer }))
          }))
          .sort((a, b) => {
            // IN_PROGRESS always first
            if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
            if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return  1;
            // Then by date descending
            return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
          });

        this.isLoading = false;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load interviews', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterStack    = '';
    this.filterLevel    = '';
    this.filterMinScore = null;
    this.filterStatus   = '';
    this.currentPage    = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.all];

    if (this.filterStack.trim()) {
      const q = this.filterStack.trim().toLowerCase();
      result  = result.filter(iv => iv.techStack.toLowerCase().includes(q));
    }
    if (this.filterLevel) {
      result = result.filter(iv => iv.level === this.filterLevel);
    }
    if (this.filterMinScore != null && !isNaN(+this.filterMinScore)) {
      result = result.filter(iv =>
        iv.score != null && iv.score >= +this.filterMinScore!
      );
    }
    if (this.filterStatus) {
      result = result.filter(iv => iv.status === this.filterStatus);
    }

    this.filtered    = result;
    this.totalPages  = Math.max(1, Math.ceil(result.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.updatePage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paged  = this.filtered.slice(start, start + this.pageSize);
  }

  resumeInterview(id: number): void {
    this.router.navigate(['/user/interview', id]);
  }

// ── Drawer ──
  drawerInterview: InterviewRow | null = null;
  drawerTab: 'qa' | 'strengths' | 'weaknesses' | 'improvements' = 'qa';

  viewDetails(iv: InterviewRow): void {
    this.drawerInterview = iv;
    this.drawerTab       = 'qa';
    document.body.style.overflow = 'hidden';
  }

  closeDrawer(): void {
    this.drawerInterview = null;
    document.body.style.overflow = '';
  }

  setDrawerTab(tab: 'qa' | 'strengths' | 'weaknesses' | 'improvements'): void {
    this.drawerTab = tab;
  }

  confirmDelete(iv: InterviewRow): void {
    this.deleteTarget = iv;
  }

  cancelDelete(): void {
    if (!this.isDeleting) this.deleteTarget = null;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.interviewService.deleteInterview(this.deleteTarget.id).subscribe({
      next: () => {
        this.all          = this.all.filter(iv => iv.id !== this.deleteTarget!.id);
        this.deleteTarget = null;
        this.isDeleting   = false;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.isDeleting   = false;
        this.cdr.detectChanges();
      }
    });
  }
}
