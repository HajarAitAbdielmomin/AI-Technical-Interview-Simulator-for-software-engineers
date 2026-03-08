import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewSetup } from './interviewSetup';

describe('InterviewSetup', () => {
  let component: InterviewSetup;
  let fixture: ComponentFixture<InterviewSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
