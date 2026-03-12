import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../storage.service';
import { AuthService } from '../../auth.service';
import { FeedbackService } from '../../feedback.service';

export interface Performance {
  score:     number;
  techStack: string;
  date:      Date;
  feedback:  string[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true
})
export class Dashboard implements OnInit {

  // ── Stats ──
  totalInterviews = 0;
  avgScore        = 0;
  bestScore       = 0;
  avgTrendLabel   = '+5 this month';
  streakDays      = 5;

  // ── Recent Performances ──
  recentPerformances: Performance[] = [];

  // user details
  userInfo: any;

  constructor(
    private router:          Router,
    private storageService:  StorageService,
    private authService:     AuthService,
    private feedbackService: FeedbackService,
    private cdr:             ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.storageService.getToken();
    if (!token) {
      setTimeout(() => this.router.navigate(['/auth/login']), 0);
      return;
    }
    this.userInfo = this.storageService.getUser();

    this.getStatistics(this.userInfo.id);
    this.getLastThreeInterviews(this.userInfo.id);

  }

 private getStatistics(id: string): void {
   this.feedbackService.getUserStatistics(id).subscribe({
     next: (res) => {
       this.avgScore        = Math.round(res[0]) ?? 0;
       this.bestScore       = Math.round(res[1]) ?? 0;
       this.totalInterviews = res[2] ?? 0;
       this.cdr.detectChanges();   // ← force re-render
     },
     error: (err) => console.error('Error fetching statistics:', err)
   });
  }
  private getLastThreeInterviews(id: string) : void {
    this.feedbackService.getLastThreeUserInterviews(this.userInfo.id).subscribe({
      next: (res) => {
        this.recentPerformances = res.map((interview: any) => ({
          score:     Math.round(interview.feedback?.score ?? 0),
          techStack: interview.techStack ?? '',
          date:      new Date(interview.startTime),
          feedback:  interview.feedback?.improvementsSuggestions
            ?.split('||')
            .map((s: string) => s.trim())
            .filter(Boolean) ?? []
        }));
        this.cdr.detectChanges();   // ← force re-render
      },
      error: (err) => console.error('Error fetching last three interviews:', err)
    });
  }
  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  getScoreDash(score: number): string {
    const c = 94.25;
    return `${(score / 100) * c} ${c - (score / 100) * c}`;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#00ff00';
    if (score >= 60) return '#ffff00';
    return '#FF0000';
  }

  goToInterviewSetup(): void {
    this.router.navigate(['user/interview']);
  }
}
