package com.techinterviewai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerResponseDto {
    private Long questionAnswerId;
    private String question;
    private String userAnswer;
    private boolean interviewComplete;
}
