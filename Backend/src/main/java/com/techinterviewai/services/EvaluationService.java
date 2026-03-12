package com.techinterviewai.services;

import com.techinterviewai.dto.feedbacksDto.FeedbackResponse;

public interface EvaluationService {
    FeedbackResponse evaluateInterview(Long interviewId);
}
