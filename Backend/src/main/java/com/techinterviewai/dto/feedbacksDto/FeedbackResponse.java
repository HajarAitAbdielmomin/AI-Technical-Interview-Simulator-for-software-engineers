package com.techinterviewai.dto.feedbacksDto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

/**
 * DTO for {@link com.techinterviewai.models.Feedback}
 */
@Data
@Builder
public class FeedbackResponse implements Serializable {
    Long id;
    String strengths;
    String weaknesses;
    String improvementsSuggestions;
    Double score;
}