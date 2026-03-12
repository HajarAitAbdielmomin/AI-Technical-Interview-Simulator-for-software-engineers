package com.techinterviewai.dto.interviewsDto;

import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.enums.Status;
import com.techinterviewai.models.Interview;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for {@link Interview}
 */
@Value
public class InterviewDataDto implements Serializable {
    Long id;
    String techStack;
    InterviewerType interviewerType;
    Level level;
    Status status;
    LocalDateTime startTime;
    LocalDateTime endTime;
    FeedbackDto feedback;
    List<QuestionAnswerDto> questionAnswer;
}