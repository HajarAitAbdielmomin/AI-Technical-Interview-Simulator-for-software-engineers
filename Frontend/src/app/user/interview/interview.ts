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
    FAANG_STRICT:     { name: 'Dr. Alex Reid', initials: 'AR', style: 'rigorous FAANG-style, algorithm-focused',  role: 'Senior Staff Engineer · FAANG' },
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

  private secondsLeft   = 300;
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
      this.endInterviewAndNavigate();
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
  private endInterviewAndNavigate(): void {
    clearInterval(this.timerInterval);
    this.isEndingInterview = true;

    this.interviewService.endInterview(this.interview.id).subscribe({
      next: () => {
        this.isEndingInterview = false;
        this.router.navigate(['/user/dashboard']);
      },
      error: (err: any) => {
        // Even if the API call fails, navigate away so the user isn't stuck
        console.error('Failed to end interview cleanly', err);
        this.isEndingInterview = false;
        this.router.navigate(['/user/dashboard']);
      }
    });
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
          // ── All 8 answered ────────────────────────────────────────────────
          this.interviewComplete = true;

          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) {
            this.messages[idx] = {
              role: 'ai',
              text: `✅ That's all ${this.MAX_QUESTIONS} questions, ${this.userName}! Great job. The interview is complete — you'll receive detailed feedback shortly.`,
              time: this.nowTime()
            };
          }
          this.shouldScroll = true;

          // Automatically call endInterview when all Q&A are done
          this.endInterviewAndNavigate();

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
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers — I'll have feedback for you shortly.`,
          time: this.nowTime()
        });
        this.shouldScroll = true;

        // Automatically end the interview when timer reaches 0
        this.endInterviewAndNavigate();
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
