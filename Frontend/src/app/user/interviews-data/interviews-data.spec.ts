import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewsData } from './interviews-data';

describe('InterviewsData', () => {
  let component: InterviewsData;
  let fixture: ComponentFixture<InterviewsData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewsData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewsData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
