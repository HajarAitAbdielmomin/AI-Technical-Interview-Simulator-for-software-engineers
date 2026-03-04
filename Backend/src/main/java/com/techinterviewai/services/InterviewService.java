package com.techinterviewai.services;

import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.models.Interview;

public interface InterviewService {
    boolean startInterview(InterviewDto interviewDto);
    Interview getInterviewById(Long id);
    boolean isComplete(Long interviewId);
    Interview findActiveInterview(Long id);
    boolean endInterview(Long interviewId);
    String getNextQuestion(Long interviewId);
}
