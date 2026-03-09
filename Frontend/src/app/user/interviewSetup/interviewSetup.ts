import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../auth.service';
import {StorageService} from '../../storage.service';
import {InterviewService} from '../../interview.service';

export type InterviewerType = 'FAANG_STRICT' | 'STARTUP_FRIENDLY' | 'HR_BEHAVIORAL';
export type InterviewLevel   = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'ARCHITECT';

export interface InterviewConfig {
  techStack:      string;
  interviewerType: InterviewerType;
  level:          InterviewLevel;
  userId:         number;
}

export interface StackOption       { name: string; emoji: string; selected: boolean; }
export interface InterviewerOption { type: InterviewerType; emoji: string; title: string; badge: string; badgeClass: string; desc: string; selected: boolean; }
export interface LevelOption       { value: InterviewLevel; label: string; hint: string; xp: string; color: string; selected: boolean; }

@Component({
  selector: 'app-interview-setup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interviewSetup.html',
  styleUrls: ['./interviewSetup.css']
})
export class InterviewSetup implements OnInit {

  currentStep     = 1;
  customInput     = '';
  customStacks: string[] = [];
  showCustomInput = false;

  presetStacks: StackOption[] = [
    { name: 'JavaScript', emoji: '🟨', selected: false },
    { name: 'TypeScript', emoji: '🔷', selected: false },
    { name: 'Python',     emoji: '🐍', selected: false },
    { name: 'Java',       emoji: '☕', selected: false },
    { name: 'Go',         emoji: '🐹', selected: false },
    { name: 'Rust',       emoji: '🦀', selected: false },
    { name: 'React',      emoji: '⚛️',  selected: false },
    { name: 'Angular',    emoji: '🅰️',  selected: false },
    { name: 'Node.js',    emoji: '🟢', selected: false },
    { name: 'SQL',        emoji: '🗃️',  selected: false },
    { name: 'Docker',     emoji: '🐳', selected: false },
  ];

  interviewers: InterviewerOption[] = [
    { type: 'FAANG_STRICT',      emoji: '🏢', title: 'FAANG Strict',      badge: 'Intense',    badgeClass: 'badge-strict',   desc: 'Google-tier rigor. Deep algorithmic challenges, system design, and complexity analysis.',   selected: false },
    { type: 'STARTUP_FRIENDLY',  emoji: '🚀', title: 'Startup Friendly',  badge: 'Relaxed',    badgeClass: 'badge-friendly', desc: 'Practical focus. Real-world problem solving and broad full-stack knowledge.',                  selected: false },
    { type: 'HR_BEHAVIORAL',     emoji: '🤝', title: 'HR Behavioral',     badge: 'Soft Skills', badgeClass: 'badge-hr',      desc: 'Competency-based. STAR method, teamwork scenarios, conflict resolution and culture fit.',    selected: false },
  ];

  levels: LevelOption[] = [
    { value: 'INTERN',    label: 'Intern',    hint: 'Fundamentals & basics',       xp: '0–1 yr',  color: '#a78bfa', selected: false },
    { value: 'JUNIOR',    label: 'Junior',    hint: 'Core concepts & patterns',    xp: '1–2 yr',  color: '#60a5fa', selected: false },
    { value: 'MID',       label: 'Mid',       hint: 'Production-grade problems',   xp: '2–4 yr',  color: '#34d399', selected: false },
    { value: 'SENIOR',    label: 'Senior',    hint: 'Architecture & deep dives',   xp: '5–8 yr',  color: '#ffd35c', selected: false },
    { value: 'LEAD',      label: 'Lead',      hint: 'Team design & strategy',      xp: '8–12 yr', color: '#fb923c', selected: false },
    { value: 'ARCHITECT', label: 'Architect', hint: 'Distributed systems mastery', xp: '12+ yr',  color: '#fc657e', selected: false },
  ];

  constructor(private router: Router, private authService: AuthService, private storageService: StorageService, private interviewService: InterviewService) {}

  // ── Getters ──
  get selectedStack(): string | undefined {
    const preset = this.presetStacks.find(s => s.selected);
    return preset ? preset.name : this.customStacks[0];
  }
  get selectedInterviewer(): InterviewerOption | undefined { return this.interviewers.find(i => i.selected); }
  get selectedLevel():       LevelOption       | undefined { return this.levels.find(l => l.selected); }

  get canProceed(): boolean {
    if (this.currentStep === 1) return !!this.selectedStack;
    if (this.currentStep === 2) return !!this.selectedInterviewer;
    if (this.currentStep === 3) return !!this.selectedLevel;
    return false;
  }
  get isLastStep(): boolean { return this.currentStep === 3; }

  // ── Stack actions ──
  selectStack(stack: StackOption): void { this.presetStacks.forEach(s => s.selected = false); this.customStacks = []; stack.selected = true; }
  toggleCustomInput(): void { this.showCustomInput = !this.showCustomInput; }
  addCustomStack(): void {
    const val = this.customInput.trim();
    if (!val) { this.customInput = ''; return; }
    this.presetStacks.forEach(s => s.selected = false);
    this.customStacks = [val];
    this.customInput = '';
  }
  removeCustomStack(): void { this.customStacks = []; }

  // ── Interviewer / Level ──
  selectInterviewer(item: InterviewerOption): void { this.interviewers.forEach(i => i.selected = false); item.selected = true; }
  selectLevel(item: LevelOption): void { this.levels.forEach(l => l.selected = false); item.selected = true; }

  // ── Navigation ──
  nextStep(): void { this.currentStep < 3 ? this.currentStep++ : this.launchInterview(); }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }

 ngOnInit(){
   if (!this.storageService.getToken()) {
     this.router.navigate(['/auth/login']);
     return;
   }
 }
  launchInterview(): void {
    const config: InterviewConfig = {
      techStack:      this.selectedStack!,
      interviewerType: this.selectedInterviewer!.type,
      level:          this.selectedLevel!.value,
      userId:          this.storageService.getUser().id,
    };
    //console.log('Launching interview with config:', config);
    this.interviewService.createInterview(config).subscribe(
      {
        next: (res) => {
          //console.log('Interview created:', res);
          this.router.navigate(['/user/interview', res])
        },
        error: (err) => console.error('Interview creation error:', err)
      }
    );
  }
}
