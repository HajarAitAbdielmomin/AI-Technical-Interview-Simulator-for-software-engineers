import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface Performance {
  score: number;
  techStack: string[];
  date: Date;
  feedback: string;
}
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true
})
export class Dashboard {
// ── User Info (replace with AuthService) ──
  userName     = 'Alex Carter';
  userEmail    = 'alex.carter@email.com';
  userInitials = 'AC';
  firstName    = 'Alex';

  // ── Stats ──
  totalInterviews = 14;
  avgScore        = 73;
  bestScore       = 91;
  avgTrendLabel   = '+5 this month';
  streakDays      = 5;

  // ── Recent Performances ──
  recentPerformances: Performance[] = [
    {
      score: 91,
      techStack: ['TypeScript', 'Node.js', 'REST API'],
      date: new Date('2025-03-01'),
      feedback: 'Excellent grasp of async patterns. Focus more on edge-case handling and error propagation in complex pipelines.'
    },
    {
      score: 74,
      techStack: ['Angular', 'RxJS'],
      date: new Date('2025-02-21'),
      feedback: 'Good component design. Deepen understanding of Observable lifecycle and memory leak prevention with proper unsubscription.'
    },
    {
      score: 62,
      techStack: ['SQL', 'PostgreSQL'],
      date: new Date('2025-02-10'),
      feedback: 'Solid basic queries. Practice query optimization, indexing strategies, and EXPLAIN ANALYZE output.'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: inject AuthService & InterviewService to load real data
  }

  onLogout(): void {
    // TODO: call AuthService.logout() then navigate
    this.router.navigate(['/auth/login']);
  }

  /** SVG stroke-dasharray for score ring — circumference = 2π × 15 ≈ 94.25 */
  getScoreDash(score: number): string {
    const c = 94.25;
    return `${(score / 100) * c} ${c - (score / 100) * c}`;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#ffd35c';
    if (score >= 60) return '#fc657e';
    return '#444';
  }
  goToInterviewSetup(): void {
    this.router.navigate(['user/interview']);
  }

}
