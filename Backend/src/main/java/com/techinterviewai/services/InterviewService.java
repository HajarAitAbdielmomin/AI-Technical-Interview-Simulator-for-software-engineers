package com.techinterviewai.services;

import com.techinterviewai.dto.ResumeInterviewResponseDto;
import com.techinterviewai.dto.QuestionAnswerDto;
import com.techinterviewai.dto.SubmitAnswerResponseDto;
import com.techinterviewai.dto.NextQuestionResponseDto;
import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.dto.InterviewDetailsDto;
import com.techinterviewai.models.QuestionAnswer;

import java.time.LocalDateTime;
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
}
