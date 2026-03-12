package com.techinterviewai.dto;

import com.techinterviewai.models.FeedbackDto;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.techinterviewai.models.Interview}
 */
@Value
public class InterviewFeedbackDto implements Serializable {
    String techStack;
    LocalDateTime startTime;
    FeedbackDto feedback;
}