import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../storage.service';
import { InterviewService } from '../../interview.service';

export type InterviewerType = 'FAANG_STRICT' | 'STARTUP_FRIENDLY' | 'JUNIOR_FRIENDLY';
export type InterviewLevel  = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'ARCHITECT';

export interface InterviewConfig {
  techStack:       string;
  interviewerType: InterviewerType;
  level:           InterviewLevel;
}

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  time: string;
  typing?: boolean;
}

export interface GenerateQuestionResponse {
  question:       string;
  questionNumber: number;
  totalQuestions: number;
  isLastQuestion: boolean;
}

export interface SubmitAnswerResponse {
  questionAnswerId:  string | number;
  question:          string;
  userAnswer:        string;
  interviewComplete: boolean;
}

/** Shape returned by interviewService.endInterview(id) — adjust fields to match your API */
export interface FeedbackResponse {
  id:                  number;
  score:               number;          // 0–100
  strengths:           string;        // list of strength points
  weaknesses:          string;        // list of weakness points
  improvementsSuggestions: string;      // list of improvement suggestions
}
export interface ParsedFeedback {
  id:                    number;
  score:                 number;
  strengths:             string[];
  weaknesses:            string[];
  improvementsSuggestions: string[];
}


@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interview.html',
  styleUrls: ['./interview.css']
})
export class Interview implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatArea') chatArea!: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLTextAreaElement>;

  interview: any = null;
  isLoading = true;

  config: InterviewConfig = {
    techStack:       '',
    interviewerType: 'FAANG_STRICT',
    level:           'MID'
  };

  userName     = '';
  userInitials = '';

  private readonly personas: Record<InterviewerType, { name: string; initials: string; style: string; role: string }> = {
    FAANG_STRICT:     { name: 'Dr. Alex Reid', initials: 'AR', style: 'rigorous FAANG-style, algorithm focused',  role: 'Senior Staff Engineer · FAANG' },
    STARTUP_FRIENDLY: { name: 'Jordan Chen',      initials: 'JC', style: 'startup-friendly, practical & pragmatic', role: 'CTO · Series-A Startup'          },
    JUNIOR_FRIENDLY:  { name: 'Sam Rivera',     initials: 'SR', style: 'junior-friendly, supportive & clear',     role: 'Senior Engineer · Mentorship'     }
  };

  get interviewerName():      string { return this.personas[this.config.interviewerType]?.name     ?? ''; }
  get interviewerInitials():  string { return this.personas[this.config.interviewerType]?.initials  ?? ''; }
  get interviewerStyleDesc(): string { return this.personas[this.config.interviewerType]?.style     ?? ''; }
  get interviewerRoleLabel(): string { return this.personas[this.config.interviewerType]?.role      ?? ''; }

  readonly MAX_QUESTIONS    = 8;
  currentQuestionNumber     = 0;
  isLastQuestion            = false;
  interviewComplete         = false;

  private secondsLeft   = 1800;
  private timerInterval: any;

  get remainingTime():  string  { const m = Math.floor(this.secondsLeft/60).toString().padStart(2,'0'); const s = (this.secondsLeft%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  get isTimerWarning(): boolean { return this.secondsLeft <= 60 && this.secondsLeft > 30; }
  get isTimerDanger():  boolean { return this.secondsLeft <= 30 && !this.timeIsUp; }
  get timeIsUp():       boolean { return this.secondsLeft <= 0  && this.interviewStarted; }

  interviewStarted     = false;
  userConfirmed        = false;
  firstQuestionVisible = false;
  isTyping             = false;
  firstQuestion        = '';
  confirmTime          = '';
  inputText            = '';
  messages: ChatMessage[] = [];
  private shouldScroll = false;

  // ── Early-exit confirmation dialog ──
  showExitDialog    = false;   // controls dialog visibility
  isEndingInterview = false;   // shows spinner while API call is in flight

  // ── Feedback card ──
  showFeedbackCard  = false;   // becomes true 5s after endInterview API responds
  feedbackData:     ParsedFeedback  | null = null;

  /** Tailwind/CSS class for the score arc colour */
  get scoreColor(): string {
    if (!this.feedbackData) return 'score-gray';
    const s = this.feedbackData.score;
    if (s >= 80) return 'score-gold';
    if (s >= 60) return 'score-amber';
    return 'score-coral';
  }

  /** Human-readable severity label */
  get scoreSeverity(): string {
    if (!this.feedbackData) return '';
    const s = this.feedbackData.score;
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Needs Work';
    return 'Poor';
  }

  get questionProgress(): string {
    if (!this.interviewStarted || this.currentQuestionNumber === 0) return '';
    return `Question ${this.currentQuestionNumber} / ${this.MAX_QUESTIONS}`;
  }

  constructor(
    private router:         Router,
    private route:          ActivatedRoute,
    private storageService: StorageService,
    private interviewService: InterviewService,
    private cdr:            ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.storageService.getToken();
    if (!token) { setTimeout(() => this.router.navigate(['/auth/login']), 0); return; }

    const user        = this.storageService.getUser();
    this.userName     = user?.username ?? user?.name ?? 'User';
    this.userInitials = this.userName.charAt(0).toUpperCase();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.interviewService.getInterviewById(params['id']).subscribe({
          next: (interview: any) => {
            this.interview = interview;
            this.applyInterviewData(interview);
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Failed to load interview', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  private applyInterviewData(data: any): void {
    const validTypes:  InterviewerType[] = ['FAANG_STRICT', 'STARTUP_FRIENDLY', 'JUNIOR_FRIENDLY'];
    const validLevels: InterviewLevel[]  = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];

    this.config = {
      techStack:       data.techStack ?? '',
      interviewerType: validTypes.includes(data.interviewerType)  ? data.interviewerType  : 'FAANG_STRICT',
      level:           validLevels.includes(data.level)           ? data.level            : 'MID'
    };

    if (data.endTime) {
      const msLeft = new Date(data.endTime).getTime() - Date.now();
      this.secondsLeft = msLeft > 0 ? Math.floor(msLeft / 1000) : 300;
    }

    this.secondsLeft = 60;

    this.cdr.markForCheck();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // END INTERVIEW — two paths
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Called by the "End Interview" button in the topbar.
   * If the interview is not yet complete (< 8 Q&A done), show a warning dialog.
   * If it is already complete, end directly.
   */
  onEndInterview(): void {
    if (!this.interviewComplete) {
      // Interview not finished → ask the user to confirm early exit
      this.showExitDialog = true;
    } else {
      // Already finished → end cleanly
      this.endInterviewAndShowFeedback();
    }
  }

  /** User confirmed early exit from the dialog */
  confirmEarlyExit(): void {
    this.showExitDialog = false;
    clearInterval(this.timerInterval);
    this.router.navigate(['/user/dashboard']);
  }

  /** User changed their mind → close the dialog and keep going */
  cancelExit(): void {
    this.showExitDialog = false;
  }

  /**
   * Calls interviewService.endInterview(id), then navigates to dashboard.
   * Used in three situations:
   *   1. User clicked "End Interview" after finishing all 8 Q&A.
   *   2. User confirmed early exit from the dialog.
   *   3. Timer ran out (automatic end).
   */
  private endInterviewAndShowFeedback(): void {
    clearInterval(this.timerInterval);
    this.isEndingInterview = true;

    // Step 1 — end the interview (API returns plain text, not JSON)
    this.interviewService.endInterview(this.interview.id).subscribe({
      next: () => {
        // Step 2 — fetch the feedback JSON in a separate call
        this.interviewService.getFeedback(this.interview.id).subscribe({
          next: (raw: FeedbackResponse) => {
            this.isEndingInterview = false;

            // Parse the '||'-delimited strings into arrays
            const feedback: ParsedFeedback = {
              id:                    raw.id,
              score:                 raw.score,
              strengths:             raw.strengths?.split('||').map(s => s.trim()).filter(Boolean) ?? [],
              weaknesses:            raw.weaknesses?.split('||').map(s => s.trim()).filter(Boolean) ?? [],
              improvementsSuggestions: raw.improvementsSuggestions?.split('||').map(s => s.trim()).filter(Boolean) ?? []
            };

            // Wait 3s after API responds (user already waited ~2s before the call)
            setTimeout(() => {
              this.feedbackData    = feedback;
              this.showFeedbackCard = true;
              this.cdr.markForCheck();
            }, 10000);
          },
          error: (err: any) => {
            console.error('getFeedback API error', err);
            this.isEndingInterview = false;
            this.router.navigate(['/user/dashboard']);
          }
        });
      },
      error: (err: any) => {
        console.error('endInterview API error', err);
        this.isEndingInterview = false;
        this.router.navigate(['/user/dashboard']);
      }
    });
  }
  // ── Gauge helpers (used in template — Math not allowed directly in Angular templates) ──
  // Half-circle arc path length ≈ π × 65 ≈ 204
  private readonly ARC_LEN = 204;

  gaugeColor(score: number): string {
    if (score >= 80) return '#ffd35c';
    if (score >= 60) return '#fb923c';
    return '#fc657e';
  }

  gaugeDashOffset(score: number): number {
    return this.ARC_LEN - (score / 100) * this.ARC_LEN;
  }

  /** X coordinate of the dot at the tip of the filled arc */
  gaugeDotX(score: number): number {
    const angle = (score / 100) * Math.PI; // 0 → π (left to right)
    return 80 - 65 * Math.cos(angle);      // centre-x = 80, radius = 65
  }

  /** Y coordinate of the dot at the tip of the filled arc */
  gaugeDotY(score: number): number {
    const angle = (score / 100) * Math.PI;
    return 95 - 65 * Math.sin(angle);      // baseline y = 95
  }
  // ══════════════════════════════════════════════════════════════════════════
  // READY
  // ══════════════════════════════════════════════════════════════════════════
  onReady(): void {
    this.userConfirmed        = true;
    this.confirmTime          = this.nowTime();
    this.interviewStarted     = true;
    this.firstQuestionVisible = true;
    this.isTyping             = true;
    this.shouldScroll         = true;

    this.startCountdown();
    this.fetchNextQuestion();
  }

  onNotReady(): void {}

  // ══════════════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ══════════════════════════════════════════════════════════════════════════
  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || !this.interviewStarted || this.timeIsUp || this.interviewComplete) return;

    this.messages.push({ role: 'user', text, time: this.nowTime() });
    this.inputText    = '';
    this.shouldScroll = true;
    if (this.inputRef) this.inputRef.nativeElement.style.height = 'auto';

    const placeholder: ChatMessage = { role: 'ai', text: '', time: '', typing: true };
    this.messages.push(placeholder);
    this.isTyping     = true;
    this.shouldScroll = true;

    this.interviewService.submitAnswer({
      interviewId: this.interview.id,
      userAnswer:  text
    }).subscribe({
      next: (res: SubmitAnswerResponse) => {
        this.isTyping = false;

        if (res.interviewComplete || this.isLastQuestion) {
          // ── All 8 answered ───────────────────────────────────────────────
          this.interviewComplete = true;

          // Replace placeholder with completion message.
          // Reassign the whole array so Angular's change detection picks it up.
          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) {
            const updated = [...this.messages];
            updated[idx] = {
              role: 'ai',
              text: `✅ That's all ${this.MAX_QUESTIONS} questions, ${this.userName}! Great job. The interview is complete, you'll receive detailed feedback shortly.`,
              time: this.nowTime()
            };
            this.messages = updated;
          }
          this.shouldScroll = true;
          this.cdr.detectChanges();

          // Wait 2s so the completion message is readable,
          // then call endInterview → getFeedback → show card after another 3s
          setTimeout(() => this.endInterviewAndShowFeedback(), 5000);

        } else {
          // ── More questions remain ─────────────────────────────────────────
          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) this.messages.splice(idx, 1);

          this.isTyping             = true;
          this.firstQuestionVisible = true;
          const nextPlaceholder: ChatMessage = { role: 'ai', text: '', time: '', typing: true };
          this.messages.push(nextPlaceholder);
          this.shouldScroll = true;

          this.interviewService.generateQuestion(this.interview.id).subscribe({
            next: (qRes: GenerateQuestionResponse) => {
              this.currentQuestionNumber = qRes.questionNumber;
              this.isLastQuestion        = qRes.isLastQuestion;
              this.isTyping              = false;

              const i = this.messages.indexOf(nextPlaceholder);
              if (i !== -1) {
                this.messages[i] = { role: 'ai', text: qRes.question, time: this.nowTime() };
              }
              this.shouldScroll = true;
              setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
            },
            error: () => {
              this.isTyping = false;
              const i = this.messages.indexOf(nextPlaceholder);
              if (i !== -1) {
                this.messages[i] = { role: 'ai', text: 'Sorry, failed to load the next question. Please try again.', time: this.nowTime() };
              }
              this.shouldScroll = true;
            }
          });
        }
      },

      error: () => {
        this.isTyping = false;
        const idx = this.messages.indexOf(placeholder);
        if (idx !== -1) {
          this.messages[idx] = { role: 'ai', text: 'Sorry, your answer could not be saved. Please try again.', time: this.nowTime() };
        }
        this.shouldScroll = true;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.sendMessage(); }
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  private fetchNextQuestion(): void {
    this.interviewService.generateQuestion(this.interview.id).subscribe({
      next: (res: GenerateQuestionResponse) => {
        this.currentQuestionNumber = res.questionNumber;
        this.isLastQuestion        = res.isLastQuestion;
        this.firstQuestion         = res.question;
        this.isTyping              = false;
        this.shouldScroll          = true;
        setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
      },
      error: () => {
        this.firstQuestion = 'Sorry, failed to load the first question. Please refresh the page.';
        this.isTyping      = false;
        this.shouldScroll  = true;
      }
    });
  }

  private startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
      } else {
        clearInterval(this.timerInterval);

        // Add the time's-up message in chat
        this.messages.push({
          role: 'ai',
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers, I'll have feedback for you shortly.`,
          time: this.nowTime()
        });
        this.shouldScroll = true;

        // Automatically end the interview when timer reaches 0
        setTimeout(() => this.endInterviewAndShowFeedback(), 5000);
      }
    }, 1000);
  }

  private scrollToBottom(): void {
    try { const el = this.chatArea?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {}
  }

  private nowTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
