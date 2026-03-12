package com.techinterviewai.dto.interviewsDto;

import com.techinterviewai.dto.feedbacksDto.FeedbacksDto;
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
    FeedbacksDto feedback;
}