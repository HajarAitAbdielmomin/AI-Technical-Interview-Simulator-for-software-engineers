package com.techinterviewai.dto.interviewsDto;

import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.enums.Status;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.techinterviewai.models.Interview}
 */
@Value
public class InterviewDto implements Serializable {
    String techStack;
    InterviewerType interviewerType;
    Level level;
    Status status;
    Long userId;
}