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

export interface FeedbackResponse {
  id:                  number;
  score:               number;
  strengths:           string;
  weaknesses:          string;
  improvementsSuggestions: string;
}
export interface ParsedFeedback {
  id:                    number;
  score:                 number;
  strengths:             string[];
  weaknesses:            string[];
  improvementsSuggestions: string[];
}

// Raw shape returned by the API
export interface ApiFeedback {
  score:                number;
  strengths:            string;
  weaknesses:           string;
  improvement_suggestions: string;
}

export interface ApiInterview {
  id:              number;
  techStack:       string;
  interviewerType: InterviewerType;
  level:           string;
  status:          'IN_PROGRESS' | 'COMPLETED';
  startTime:       string;
  endTime:         string | null;
  feedback:        ApiFeedback | null;
  questionAnswer:  { question: string; userAnswer: string; interviewId: null }[];
}
// Mapped shape used by the template (includes parsed data for drawer)
export interface InterviewRow {
  id:              number;
  interviewerType: InterviewerType;
  techStack:       string;
  level:           string;
  status:          'IN_PROGRESS' | 'COMPLETED';
  startTime:       string;
  endTime:         string | null;
  score:           number | null;
  strengths:       string[];
  weaknesses:      string[];
  improvements:    string[];
  questionAnswer:  { question: string; userAnswer: string }[];
}

export interface StackOption       { name: string; emoji: string; selected: boolean; }
export interface InterviewerOption { type: InterviewerType; emoji: string; title: string; badge: string; badgeClass: string; desc: string; selected: boolean; }
export interface LevelOption       { value: InterviewLevel; label: string; hint: string; xp: string; color: string; selected: boolean; }

export interface InterviewSetupConfig {
  techStack:      string;
  interviewerType: InterviewerType;
  level:          InterviewLevel;
  userId:         number;
}

export const  presetStacks: StackOption[] = [
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
export const interviewers: InterviewerOption[] = [
  { type: 'FAANG_STRICT',      emoji: '🏢', title: 'FAANG Strict',      badge: 'Intense',    badgeClass: 'badge-strict',   desc: 'Google-tier rigor. Deep algorithmic challenges, system design, and complexity analysis.',   selected: false },
  { type: 'STARTUP_FRIENDLY',  emoji: '🚀', title: 'Startup Friendly',  badge: 'Relaxed',    badgeClass: 'badge-friendly', desc: 'Practical focus. Real-world problem solving and broad full-stack knowledge.',                  selected: false },
  { type: 'JUNIOR_FRIENDLY',    emoji: '🤝', title: 'Junior Friendly',    badge: 'Beginner',   badgeClass: 'badge-junior',  desc: 'Beginner-focused. Fundamentals, clear explanations, and supportive guidance.',                selected: false },
];

export const levels: LevelOption[] = [
  { value: 'INTERN',    label: 'Intern',    hint: 'Fundamentals & basics',       xp: '0–1 yr',  color: '#a78bfa', selected: false },
  { value: 'JUNIOR',    label: 'Junior',    hint: 'Core concepts & patterns',    xp: '1–2 yr',  color: '#60a5fa', selected: false },
  { value: 'MID',       label: 'Mid',       hint: 'Production-grade problems',   xp: '2–4 yr',  color: '#34d399', selected: false },
  { value: 'SENIOR',    label: 'Senior',    hint: 'Architecture & deep dives',   xp: '5–8 yr',  color: '#ffd35c', selected: false },
  { value: 'LEAD',      label: 'Lead',      hint: 'Team design & strategy',      xp: '8–12 yr', color: '#fb923c', selected: false },
  { value: 'ARCHITECT', label: 'Architect', hint: 'Distributed systems mastery', xp: '12+ yr',  color: '#fc657e', selected: false },
];

export const levelsList = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT'];
