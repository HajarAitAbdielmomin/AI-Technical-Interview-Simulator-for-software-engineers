package com.techinterviewai.dto.interviewsDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.techinterviewai.models.Feedback}
 */
@Value
public class FeedbackDto implements Serializable {
    String strengths;
    String weaknesses;
    @JsonProperty("improvement_suggestions")
    String improvementsSuggestions;
    Double score;
}