package com.techinterviewai.dto.interviewsDto;

import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.enums.Status;
import com.techinterviewai.models.QuestionAnswer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeInterviewResponseDto {
    private Long interviewId;
    private Status status;
    private String techStack;
    private InterviewerType interviewerType;
    private Level level;
    private long remainingSeconds;
    private int questionsAnswered;
    private int totalQuestions;
    private List<QuestionAnswer> history;
}
