package com.techinterviewai.services;

import com.techinterviewai.dto.feedbacksDto.FeedbackResponse;
import com.techinterviewai.dto.interviewsDto.*;
import com.techinterviewai.models.QuestionAnswer;

import java.time.LocalDateTime;
import java.util.List;

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
    List<InterviewFeedbackDto> getLastThreeCompletedInterviews(Long userId);
    List<InterviewDataDto> getAllInterviewsByUser(Long userId);
}
