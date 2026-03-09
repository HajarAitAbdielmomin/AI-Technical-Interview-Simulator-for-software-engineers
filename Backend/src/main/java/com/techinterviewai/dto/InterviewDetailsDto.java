package com.techinterviewai.dto;

import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDetailsDto {
    private Long id;
    private String techStack;
    private InterviewerType interviewerType;
    private Level level;
    private Status status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
