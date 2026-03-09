import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
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

  get interviewerName():      string { return this.personas[this.config.interviewerType].name; }
  get interviewerInitials():  string { return this.personas[this.config.interviewerType].initials; }
  get interviewerStyleDesc(): string { return this.personas[this.config.interviewerType].style; }
  get interviewerRoleLabel(): string { return this.personas[this.config.interviewerType].role; }

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private interviewService: InterviewService
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
            console.log('interview loaded', interview);
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
  // API shape: { id, techStack, interviewerType, level, status, startTime, endTime }
  // ─────────────────────────────────────────
  private applyInterviewData(data: any): void {

    // techStack — API returns plain string e.g. "K8"
    this.config.techStack = data.techStack ?? '';

    // interviewerType — API returns "HR_BEHAVIORAL" | "FAANG_STRICT" | "STARTUP_FRIENDLY"
    const validTypes: InterviewerType[] = ['FAANG_STRICT', 'STARTUP_FRIENDLY', 'HR_BEHAVIORAL'];
    const rawType = (data.interviewerType ?? 'FAANG_STRICT') as InterviewerType;
    this.config.interviewerType = validTypes.includes(rawType) ? rawType : 'FAANG_STRICT';

    // level — API returns "JUNIOR" | "MID" | "SENIOR" etc.
    const validLevels: InterviewLevel[] = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];
    const rawLevel = (data.level ?? 'MID') as InterviewLevel;
    this.config.level = validLevels.includes(rawLevel) ? rawLevel : 'MID';

    // Duration — compute from endTime − now (API provides ISO strings)
    // e.g. startTime: "2026-03-09T12:15:17.912551", endTime: "2026-03-09T12:45:17.912551"
    if (data.endTime) {
      const msLeft = new Date(data.endTime).getTime() - Date.now();
      // If endTime is already past (resumed session), fall back to 5 min
      this.secondsLeft = msLeft > 0 ? Math.floor(msLeft / 1000) : 300;
    }
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

    setTimeout(() => {
      this.firstQuestion = this.buildFirstQuestion();
      this.isTyping      = false;
      this.shouldScroll  = true;
      setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
    }, 2200);
  }

  onNotReady(): void {}

  // ── Send message ──
  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || !this.interviewStarted || this.timeIsUp) return;

    this.messages.push({ role: 'user', text, time: this.nowTime() });
    this.inputText    = '';
    this.shouldScroll = true;

    if (this.inputRef) this.inputRef.nativeElement.style.height = 'auto';

    setTimeout(() => {
      const placeholder: ChatMessage = { role: 'ai', text: '...', time: '' };
      this.messages.push(placeholder);
      this.shouldScroll = true;

      setTimeout(() => {
        const idx = this.messages.indexOf(placeholder);
        if (idx !== -1) {
          this.messages[idx] = {
            role: 'ai',
            text: this.generateResponse(),
            time: this.nowTime()
          };
          this.shouldScroll = true;
        }
      }, 1800);
    }, 600);
  }

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
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers — I'll have feedback for you shortly.`,
          time: this.nowTime()
        });
        this.shouldScroll = true;
      }
    }, 1000);
  }

  // ── Build opening question from interviewerType + techStack + level ──
  private buildFirstQuestion(): string {
    const stack = this.config.techStack || 'the relevant technologies';
    const level = this.config.level;

    const map: Record<InterviewerType, string> = {
      FAANG_STRICT:
        `Let's start with a classic ${stack} question at the ${level} level. Given an array of integers, write a function that returns the two numbers adding up to a specific target. What's your approach and time complexity?`,
      STARTUP_FRIENDLY:
        `Great! Tell me about a recent ${stack} project you shipped at a ${level} level. What problem did it solve, and what would you do differently today?`,
      HR_BEHAVIORAL:
        `Let's begin. As a ${level} engineer working with ${stack}, tell me about a time you had a significant disagreement with a teammate. How did you handle it and what was the outcome?`
    };

    return map[this.config.interviewerType];
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

  private generateResponse(): string {
    // TODO: replace with real AI call via InterviewService
    const pool = [
      `Good answer! Can you walk me through the time and space complexity of that approach?`,
      `Interesting. How would you handle edge cases like empty input or duplicates?`,
      `That's solid thinking. How would you scale this for a dataset of 10 million entries?`,
      `Nice approach. How would you write unit tests for this?`,
      `Great. Can you optimize it further?`
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
