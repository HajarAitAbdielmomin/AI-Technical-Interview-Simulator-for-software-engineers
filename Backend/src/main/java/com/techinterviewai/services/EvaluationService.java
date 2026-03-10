package com.techinterviewai.services;

import com.techinterviewai.dto.FeedbackResponse;
import com.techinterviewai.models.Interview;

public interface EvaluationService {
    FeedbackResponse evaluateInterview(Long interviewId);
}
