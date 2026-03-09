import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {StorageService} from '../../storage.service';

export type InterviewerType = 'FAANG_STRICT' | 'STARTUP_FRIENDLY' | 'HR_BEHAVIORAL';
export type InterviewLevel  = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'ARCHITECT';

export interface InterviewConfig {
  techStack:       string[];
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

  // ── Config (from router state) ──
  config: InterviewConfig = {
    techStack:       ['Angular', 'TypeScript'],
    interviewerType: 'FAANG_STRICT',
    level:           'MID'
  };

  // ── User (replace with AuthService) ──
  userName     = 'Alex';
  userInitials = 'AC';

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

  // ── Timer state ── 5 minutes = 300 seconds ──
  private readonly DURATION = 300;
  private secondsLeft       = this.DURATION;
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

  private readonly firstQuestions: Record<InterviewerType, string> = {
    FAANG_STRICT:
      `Let's start with a classic. Given an array of integers, write a function that returns the two numbers that add up to a specific target. What's your approach and what's the time complexity?`,
    STARTUP_FRIENDLY:
      `Great! Tell me about a recent project you shipped. What was the tech stack, what problem did it solve, and what would you do differently if you rebuilt it today?`,
    HR_BEHAVIORAL:
      `Let's begin. Tell me about a time you had a significant disagreement with a teammate or manager. How did you handle it, and what was the outcome?`
  };

  constructor(private router: Router, private storageService: StorageService) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['config']) {
      this.config = nav.extras.state['config'] as InterviewConfig;
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
      this.firstQuestion = this.firstQuestions[this.config.interviewerType];
      this.isTyping      = false;
      this.shouldScroll  = true;
      setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
    }, 2200);
  }

  onNotReady(): void { /* user asked for a moment — do nothing */ }

  // ── Send message ──
  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || !this.interviewStarted || this.timeIsUp) return;

    this.messages.push({ role: 'user', text, time: this.nowTime() });
    this.inputText    = '';
    this.shouldScroll = true;

    if (this.inputRef) this.inputRef.nativeElement.style.height = 'auto';

    // Simulate AI response
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
        // Auto-add a time's up message from interviewer
        this.messages.push({
          role: 'ai',
          text: `⏱️ Time's up, ${this.userName}! That wraps up our session. Thank you for your answers — I'll have feedback for you shortly.`,
          time: this.nowTime()
        });
        this.shouldScroll = true;
      }
    }, 1000);
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
    // Placeholder — wire to your AI/backend service
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
