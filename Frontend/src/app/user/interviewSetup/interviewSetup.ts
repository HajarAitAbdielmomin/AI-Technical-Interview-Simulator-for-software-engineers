import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../auth.service';
import {StorageService} from '../../storage.service';
import {InterviewService} from '../../interview.service';
import {
  StackOption,
  InterviewerOption,
  LevelOption,
  InterviewSetupConfig,
  presetStacks,
  interviewers,
  levels
}
  from '../../utils/InterviewsData';



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





  constructor(private router: Router, private authService: AuthService, private storageService: StorageService, private interviewService: InterviewService) {}

  // ── Getters ──
  get selectedStack(): string | undefined {
    const preset = presetStacks.find(s => s.selected);
    return preset ? preset.name : this.customStacks[0];
  }
  get selectedInterviewer(): InterviewerOption | undefined { return interviewers.find(i => i.selected); }
  get selectedLevel():       LevelOption       | undefined { return levels.find(l => l.selected); }

  get canProceed(): boolean {
    if (this.currentStep === 1) return !!this.selectedStack;
    if (this.currentStep === 2) return !!this.selectedInterviewer;
    if (this.currentStep === 3) return !!this.selectedLevel;
    return false;
  }
  get isLastStep(): boolean { return this.currentStep === 3; }

  // ── Stack actions ──
  selectStack(stack: StackOption): void { presetStacks.forEach(s => s.selected = false); this.customStacks = []; stack.selected = true; }
  toggleCustomInput(): void { this.showCustomInput = !this.showCustomInput; }
  addCustomStack(): void {
    const val = this.customInput.trim();
    if (!val) { this.customInput = ''; return; }
    presetStacks.forEach(s => s.selected = false);
    this.customStacks = [val];
    this.customInput = '';
  }
  removeCustomStack(): void { this.customStacks = []; }

  // ── Interviewer / Level ──
  selectInterviewer(item: InterviewerOption): void { interviewers.forEach(i => i.selected = false); item.selected = true; }
  selectLevel(item: LevelOption): void { levels.forEach(l => l.selected = false); item.selected = true; }

  // ── Navigation ──
  nextStep(): void { this.currentStep < 3 ? this.currentStep++ : this.launchInterview(); }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }

 ngOnInit(){
   const token = this.storageService.getToken();
   if (!token) {
     setTimeout(() => this.router.navigate(['/auth/login']), 0);
     return;
   }
 }
  launchInterview(): void {
    const config: InterviewSetupConfig = {
      techStack:      this.selectedStack!,
      interviewerType: this.selectedInterviewer!.type,
      level:          this.selectedLevel!.value,
      userId:          this.storageService.getUser().id,
    };
   // this.router.navigate(['/user/interview', 0])
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

  protected readonly presetStacks = presetStacks;
  protected readonly levels = levels;
  protected readonly interviewers = interviewers;
}
