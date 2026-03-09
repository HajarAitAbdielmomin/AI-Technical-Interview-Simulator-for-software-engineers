import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../storage.service';
import { InterviewService } from '../../interview.service';

export type InterviewerType = 'FAANG_STRICT' | 'STARTUP_FRIENDLY' | 'HR_BEHAVIORAL';
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
}
// ── Shapes returned by your backend ──────────────────────────────────────────

/** Response from POST /generate-question (or equivalent) */
export interface GenerateQuestionResponse {
  question:       string;   // the question text to display
  questionNumber: number;   // e.g. 1 … 8
  totalQuestions: number;   // always 8
  isLastQuestion: boolean;  // true when questionNumber === 8
}

/** Response from POST /submit-answer (or equivalent) */
export interface SubmitAnswerResponse {
  questionAnswerId:  string | number;  // saved record id
  question:          string;           // echoed back question text
  userAnswer:        string;           // echoed back answer text
  interviewComplete: boolean;          // true when all 8 answers submitted
}

// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Raw API response ──
  // Shape: { id, techStack, interviewerType, level, status, startTime, endTime }
  interview: any = null;
  isLoading = true;

  // ── Config ──
  config: InterviewConfig = {
    techStack:       '',
    interviewerType: 'FAANG_STRICT',
    level:           'MID'
  };

  // ── User ──
  userName     = '';
  userInitials = '';

  // ── Interviewer personas ──
  private readonly personas: Record<InterviewerType, { name: string; initials: string; style: string; role: string }> = {
    FAANG_STRICT: {
      name:     'Dr. Marcus Reid',
      initials: 'MR',
      style:    'rigorous FAANG-style, algorithm-focused',
      role:     'Senior Staff Engineer · FAANG'
    },
    STARTUP_FRIENDLY: {
      name:     'Sofia Chen',
      initials: 'SC',
      style:    'startup-friendly, practical & pragmatic',
      role:     'CTO · Series-A Startup'
    },
    HR_BEHAVIORAL: {
      name:     'James Okafor',
      initials: 'JO',
      style:    'HR behavioral, STAR-method focused',
      role:     'Head of Talent · Tech Division'
    }
  };

  get interviewerName():      string { return this.personas[this.config.interviewerType]?.name ?? ''; }
  get interviewerInitials():  string { return this.personas[this.config.interviewerType]?.initials ?? ''; }
  get interviewerStyleDesc(): string { return this.personas[this.config.interviewerType]?.style ?? ''; }
  get interviewerRoleLabel(): string { return this.personas[this.config.interviewerType]?.role ?? ''; }

  // ── Question tracking (max 8) ──
  readonly MAX_QUESTIONS   = 8;
  currentQuestionNumber    = 0;   // increments after each GenerateQuestionResponse
  isLastQuestion           = false;
  interviewComplete        = false;

  // ── Timer ──
  private secondsLeft  = 300; // overridden by endTime − now
  private timerInterval: any;

  get remainingTime(): string {
    const m = Math.floor(this.secondsLeft / 60).toString().padStart(2, '0');
    const s = (this.secondsLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
  get isTimerWarning(): boolean { return this.secondsLeft <= 60 && this.secondsLeft > 30; }
  get isTimerDanger():  boolean { return this.secondsLeft <= 30 && !this.timeIsUp; }
  get timeIsUp():       boolean { return this.secondsLeft <= 0 && this.interviewStarted; }

  // ── Chat state ──
  interviewStarted     = false;
  userConfirmed        = false;
  firstQuestionVisible = false;
  isTyping             = false;
  firstQuestion        = '';
  confirmTime          = '';
  inputText            = '';
  messages: ChatMessage[] = [];

  private shouldScroll = false;

  // Progress bar label shown in topbar e.g. "Question 2 / 8"
  get questionProgress(): string {
    if (!this.interviewStarted || this.currentQuestionNumber === 0) return '';
    return `Question ${this.currentQuestionNumber} / ${this.MAX_QUESTIONS}`;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private interviewService: InterviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.storageService.getToken();
    if (!token) {
      setTimeout(() => this.router.navigate(['/auth/login']), 0);
      return;
    }

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
            //console.log('interview loaded', this.interview);
          },
          error: (err: any) => {
            console.error('Failed to load interview', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  // ─────────────────────────────────────────
  // Map exact API fields to component state
  // API shape: { id, techStack, interviewerType, level }
  // ─────────────────────────────────────────
  private applyInterviewData(data: any): void {
    this.config = {
      techStack:       data.techStack ?? '',
      interviewerType: data.interviewerType,
      level:           data.level
    };

    if (data.endTime) {
      const msLeft = new Date(data.endTime).getTime() - Date.now();
      this.secondsLeft = msLeft > 0 ? Math.floor(msLeft / 1000) : 300;
    }

    this.cdr.markForCheck();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  // ── Ready ──
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


  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  onEndInterview(): void {
    clearInterval(this.timerInterval);
    this.router.navigate(['/user/dashboard']);
  }

  // ── Countdown ──
  private startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
      } else {
        clearInterval(this.timerInterval);
        this.messages.push({
          role: 'ai',
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers, I'll have feedback for you shortly.`,
          time: this.nowTime()
        });
        this.shouldScroll = true;
      }
    }, 1000);
  }
  private fetchNextQuestion(): void {
    this.interviewService.generateQuestion(this.interview.id).subscribe({
      next: (res: GenerateQuestionResponse) => {
        this.currentQuestionNumber = res.questionNumber;   // → 1
        this.isLastQuestion        = res.isLastQuestion;   // false unless MAX=1
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
  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || !this.interviewStarted || this.timeIsUp || this.interviewComplete) return;

    // 1. Show user bubble immediately
    this.messages.push({ role: 'user', text, time: this.nowTime() });
    this.inputText    = '';
    this.shouldScroll = true;
    if (this.inputRef) this.inputRef.nativeElement.style.height = 'auto';

    // 2. Show typing indicator
    const placeholder: ChatMessage = { role: 'ai', text: '...', time: '' };
    this.messages.push(placeholder);
    this.isTyping     = true;
    this.shouldScroll = true;

    // 3. Submit the answer to your API
    this.interviewService.submitAnswer({
      interviewId:     this.interview.id,   // from getInterviewById response
      userAnswer:          text,                // user's typed answer
    }).subscribe({
      next: (res: SubmitAnswerResponse) => {
        this.isTyping = false;

        if (res.interviewComplete || this.isLastQuestion) {
          // ── All 8 answers submitted ──────────────────────────────────────
          this.interviewComplete = true;
          clearInterval(this.timerInterval);

          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) {
            this.messages[idx] = {
              role: 'ai',
              text: `✅ That's all ${this.MAX_QUESTIONS} questions! Great job, ${this.userName}. The interview is complete — you'll receive detailed feedback shortly.`,
              time: this.nowTime()
            };
          }
          this.shouldScroll = true;

        } else {
          // ── More questions remain → fetch the next one ───────────────────
          // Replace the typing placeholder with a short bridge message (optional),
          // then immediately fetch the next question.
          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) this.messages.splice(idx, 1); // remove old placeholder

          this.isTyping             = true;
          this.firstQuestionVisible = true;
          const nextPlaceholder: ChatMessage = { role: 'ai', text: '...', time: '' };
          this.messages.push(nextPlaceholder);
          this.shouldScroll = true;

          this.interviewService.generateQuestion(this.interview.id).subscribe({
            next: (qRes: GenerateQuestionResponse) => {
              this.currentQuestionNumber = qRes.questionNumber;
              this.isLastQuestion        = qRes.isLastQuestion;
              this.isTyping              = false;

              const i = this.messages.indexOf(nextPlaceholder);
              if (i !== -1) {
                this.messages[i] = {
                  role: 'ai',
                  text: qRes.question,
                  time: this.nowTime()
                };
              }
              this.shouldScroll = true;
              setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
            },
            error: () => {
              this.isTyping = false;
              const i = this.messages.indexOf(nextPlaceholder);
              if (i !== -1) {
                this.messages[i] = {
                  role: 'ai',
                  text: 'Sorry, failed to load the next question. Please try again.',
                  time: this.nowTime()
                };
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
          this.messages[idx] = {
            role: 'ai',
            text: 'Sorry, your answer could not be saved. Please try again.',
            time: this.nowTime()
          };
        }
        this.shouldScroll = true;
      }
    });
  }


  private scrollToBottom(): void {
    try {
      const el = this.chatArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private nowTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
