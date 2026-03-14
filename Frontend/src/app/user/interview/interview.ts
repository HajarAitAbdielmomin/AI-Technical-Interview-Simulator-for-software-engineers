import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../storage.service';
import { InterviewService } from '../../interview.service';
import {
  InterviewerType,
  InterviewLevel,
  ChatMessage,
  GenerateQuestionResponse,
  SubmitAnswerResponse,
  FeedbackResponse,
  ParsedFeedback,
  InterviewConfig, ResumeData
}
  from '../../utils/InterviewsData';


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

  // ── Resume ──
  isResume         = false;
  resumeHistory:   { question: string; userAnswer: string | null }[] = [];
  resumeRemaining  = 0;

  private secondsLeft   = 1800;
  private timerInterval: any;
  timerExpired = false;

  get remainingTime():  string  { const m = Math.floor(this.secondsLeft/60).toString().padStart(2,'0');
                                  const s = (this.secondsLeft%60).toString().padStart(2,'0');
                                  return `${m}:${s}`; }
  get isTimerWarning(): boolean { return this.secondsLeft <= 60 && this.secondsLeft > 30; }
  get isTimerDanger():  boolean { return this.secondsLeft <= 30 && !this.timerExpired; }
  get timeIsUp():       boolean { return this.timerExpired; }

  interviewStarted     = false;
  userConfirmed        = false;
  firstQuestionVisible = false;
  isTyping             = false;
  firstQuestion        = '';
  confirmTime          = '';
  inputText            = '';
  messages: ChatMessage[] = [];
  private shouldScroll = false;

  // Early exit confirmation dialog
  showExitDialog    = false;
  isEndingInterview = false;

  // Feedback card
  showFeedbackCard  = false;
  feedbackData:     ParsedFeedback  | null = null;


  get scoreColor(): string {
    if (!this.feedbackData) return 'score-gray';
    const s = this.feedbackData.score;
    if (s >= 80) return 'score-gold';
    if (s >= 60) return 'score-amber';
    return 'score-coral';
  }

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
    private cdr:            ChangeDetectorRef,
    private ngZone:         NgZone
  ) {}

  ngOnInit(): void {
    const user        = this.storageService.getUser();
    this.userName     = user?.username ?? user?.name ?? 'User';
    this.userInitials = this.userName.charAt(0).toUpperCase();

    // Read ?resume=true query param
    this.isResume = this.route.snapshot.queryParamMap.get('resume') === 'true';

    this.route.params.subscribe(params => {
      if (params['id']) {
        if (this.isResume) {
          // ── Resume path ──────────────────────────────────────────────────
          this.interviewService.getResumeData(params['id']).subscribe({
            next: (resume: ResumeData) => {
              this.interview = { id: resume.interviewId };
              this.applyResumeData(resume);
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              console.error('Failed to load resume data', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          // ── Fresh start path ─────────────────────────────────────────────
          this.interviewService.getInterviewById(params['id']).subscribe({
            next: (interview: any) => {
              this.interview = interview;
              this.applyInterviewData(interview);
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              console.error('Failed to load interview', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
  }
  private applyResumeData(resume: ResumeData): void {
    const validTypes:  InterviewerType[] = ['FAANG_STRICT', 'STARTUP_FRIENDLY', 'JUNIOR_FRIENDLY'];
    const validLevels: InterviewLevel[]  = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];

    this.config = {
      techStack:       resume.techStack ?? '',
      interviewerType: validTypes.includes(resume.interviewerType)  ? resume.interviewerType  : 'FAANG_STRICT',
      level:           validLevels.includes(resume.level)           ? resume.level            : 'MID'
    };

    this.resumeRemaining       = resume.remainingSeconds ?? 1800;
    this.secondsLeft           = this.resumeRemaining;
    this.currentQuestionNumber = resume.questionsAnswered;
    this.isLastQuestion        = resume.questionsAnswered >= resume.totalQuestions - 1;
    this.resumeHistory         = (resume.history ?? []).map(qa => ({
      question:   qa.question,
      userAnswer: qa.userAnswer
    }));
  }

  // Called when user clicks "Continue Interview" on the resume welcome screen
  onResumeConfirm(): void {
    this.userConfirmed        = true;
    this.confirmTime          = this.nowTime();
    this.interviewStarted     = true;
    this.firstQuestionVisible = true;
    this.isTyping             = true;
    this.shouldScroll         = true;

    // Pre-fill messages with history
    const history: ChatMessage[] = [];
    for (const qa of this.resumeHistory) {
      history.push({ role: 'ai',  text: qa.question,   time: '' });
      if (qa.userAnswer) {
        history.push({ role: 'user', text: qa.userAnswer, time: '' });
      }
    }
    this.messages = history;

    this.startCountdown();
    this.fetchNextQuestion();
  }
  private applyInterviewData(data: any): void {
    const validTypes:  InterviewerType[] = ['FAANG_STRICT', 'STARTUP_FRIENDLY', 'JUNIOR_FRIENDLY'];
    const validLevels: InterviewLevel[]  = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];

    this.config = {
      techStack:       data.techStack ?? '',
      interviewerType: validTypes.includes(data.interviewerType)  ? data.interviewerType  : 'FAANG_STRICT',
      level:           validLevels.includes(data.level)           ? data.level            : 'MID'
    };

    this.secondsLeft = 1800;

    this.cdr.markForCheck();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  onEndInterview(): void {
    if (!this.interviewComplete) {
      this.showExitDialog = true;
    } else {
      this.endInterviewAndShowFeedback();
    }
  }

  confirmEarlyExit(): void {
    this.showExitDialog = false;
    clearInterval(this.timerInterval);
    this.router.navigate(['/user/dashboard']);
  }

  cancelExit(): void {
    this.showExitDialog = false;
  }

  private endInterviewAndShowFeedback(): void {
    clearInterval(this.timerInterval);
    this.isEndingInterview = true;
    this.interviewService.endInterview(this.interview.id).subscribe({
      next: () => {
        this.interviewService.getFeedback(this.interview.id).subscribe({
          next: (raw: FeedbackResponse) => {
            this.isEndingInterview = false;

            const feedback: ParsedFeedback = {
              id:                    raw.id,
              score:                 raw.score,
              strengths:             raw.strengths?.split('||').map(s => s.trim()).filter(Boolean) ?? [],
              weaknesses:            raw.weaknesses?.split('||').map(s => s.trim()).filter(Boolean) ?? [],
              improvementsSuggestions: raw.improvementsSuggestions?.split('||').map(s => s.trim()).filter(Boolean) ?? []
            };

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

  private readonly ARC_LEN = 204;

  gaugeColor(score: number): string {
    if (score >= 80) return '#ffd35c';
    if (score >= 60) return '#fb923c';
    return '#fc657e';
  }

  gaugeDashOffset(score: number): number {
    return this.ARC_LEN - (score / 100) * this.ARC_LEN;
  }

  gaugeDotX(score: number): number {
    const angle = (score / 100) * Math.PI;
    return 80 - 65 * Math.cos(angle);
  }

  gaugeDotY(score: number): number {
    const angle = (score / 100) * Math.PI;
    return 95 - 65 * Math.sin(angle);
  }

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
          this.interviewComplete = true;

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

          setTimeout(() => this.endInterviewAndShowFeedback(), 2000);

        } else {
          const idx = this.messages.indexOf(placeholder);
          if (idx !== -1) this.messages.splice(idx, 1);

          this.isTyping             = true;
          this.firstQuestionVisible = true;
          const nextPlaceholder: ChatMessage = { role: 'ai', text: '', time: '', typing: true };
          this.messages.push(nextPlaceholder);
          this.shouldScroll = true;

          this.interviewService.generateQuestion(this.interview.id).subscribe({
            next: (qRes: GenerateQuestionResponse) => {
              this.ngZone.run(() => {
                this.currentQuestionNumber = qRes.questionNumber;
                this.isLastQuestion        = qRes.isLastQuestion;
                this.isTyping              = false;

                const i = this.messages.indexOf(nextPlaceholder);
                if (i !== -1) {
                  const updated = [...this.messages];
                  updated[i] = { role: 'ai', text: qRes.question, time: this.nowTime() };
                  this.messages = updated;
                }
                this.shouldScroll = true;
                this.cdr.detectChanges();
                setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
              });
            },
            error: () => {
              this.ngZone.run(() => {
                this.isTyping = false;
                const i = this.messages.indexOf(nextPlaceholder);
                if (i !== -1) {
                  const updated = [...this.messages];
                  updated[i] = { role: 'ai', text: 'Sorry, failed to load the next question. Please try again.', time: this.nowTime() };
                  this.messages = updated;
                }
                this.shouldScroll = true;
                this.cdr.detectChanges();
              });
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

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  private fetchNextQuestion(): void {
    this.interviewService.generateQuestion(this.interview.id).subscribe({
      next: (res: GenerateQuestionResponse) => {
        this.ngZone.run(() => {
          this.currentQuestionNumber = res.questionNumber;
          this.isLastQuestion        = res.isLastQuestion;
          this.firstQuestion         = res.question;
          this.isTyping              = false;
          this.shouldScroll          = true;
          this.cdr.detectChanges();
          setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.firstQuestion = 'Sorry, failed to load the first question. Please refresh the page.';
          this.isTyping      = false;
          this.shouldScroll  = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  private startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.timerInterval);
        this.timerExpired = true;
        this.messages = [...this.messages, {
          role: 'ai',
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers, I'll have feedback for you in 3s.`,
          time: this.nowTime()
        }];
        this.shouldScroll = true;
        this.cdr.detectChanges();
        setTimeout(() => this.endInterviewAndShowFeedback(), 2000);
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
