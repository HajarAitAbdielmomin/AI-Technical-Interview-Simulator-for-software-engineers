package com.techinterviewai.dto.interviewsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NextQuestionResponseDto {
    private String question;
    private int questionNumber;
    private int totalQuestions;
    private boolean isLastQuestion;
}
