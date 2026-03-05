package com.techinterviewai.services;

import com.techinterviewai.dto.SubmitAnswerResponseDto;
import com.techinterviewai.dto.NextQuestionResponseDto;
import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;

import java.util.Optional;

public interface InterviewService {
    boolean startInterview(InterviewDto interviewDto);
    Interview getInterviewById(Long id);
    boolean isComplete(Long interviewId);
    boolean endInterview(Long interviewId);
    NextQuestionResponseDto getNextQuestion(Long interviewId);
    SubmitAnswerResponseDto submitAnswer(Long interviewId, String userAnswer);
    void validateNoPendingAnswer(Long interviewId);
}
