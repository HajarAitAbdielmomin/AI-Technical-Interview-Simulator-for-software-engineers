package com.techinterviewai.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.techinterviewai.models.QuestionAnswer}
 */
@Setter
@Data
public class QuestionAnswerDto implements Serializable {
    String question;
    String userAnswer;
    Long interviewId;
}