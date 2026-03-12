package com.techinterviewai.models;

import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link Feedback}
 */
@Value
public class FeedbackDto implements Serializable {
    String improvementsSuggestions;
    Double score;
}