package com.techinterviewai.dto.feedbacksDto;

import com.techinterviewai.models.Feedback;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link Feedback}
 */
@Value
public class FeedbacksDto implements Serializable {
    String improvementsSuggestions;
    Double score;
}