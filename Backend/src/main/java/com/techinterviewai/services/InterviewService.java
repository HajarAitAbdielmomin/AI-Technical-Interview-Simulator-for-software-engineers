package com.techinterviewai.services;

import com.techinterviewai.dto.*;
import com.techinterviewai.models.QuestionAnswer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewService {
    Long startInterview(InterviewDto interviewDto);
    InterviewDetailsDto getInterviewById(Long id);
    boolean isComplete(Long interviewId);
    boolean endInterview(Long interviewId);
    String getNextQuestion(Long interviewId);
    QuestionAnswer submitAnswer(QuestionAnswerDto questionAnswerDto);
    void validateNoPendingAnswer(Long interviewId);
    Long getRemainingTime(LocalDateTime startTime);
    ResumeInterviewResponseDto resumeInterview(Long interviewId);
    int getQuestionCount(Long interviewId);
    FeedbackResponse getFeedback(Long interviewId);
    List<InterviewDetailsDto> getLastThreeCompletedInterviews(Long userId);
}
