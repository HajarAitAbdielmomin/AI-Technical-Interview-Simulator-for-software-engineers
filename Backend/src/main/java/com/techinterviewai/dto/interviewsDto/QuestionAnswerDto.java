package com.techinterviewai.dto.interviewsDto;

import lombok.Builder;
import lombok.Data;
import lombok.Setter;

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