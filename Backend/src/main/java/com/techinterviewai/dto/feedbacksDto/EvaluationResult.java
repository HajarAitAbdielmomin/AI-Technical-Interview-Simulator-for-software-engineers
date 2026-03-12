package com.techinterviewai.dto.feedbacksDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

/**
 * Internal DTO — maps directly from the AI's raw JSON response.
 * Never exposed to the controller.
 */
@Data
public class EvaluationResult {
    private Integer score;
    private List<String> strengths;
    private List<String> weaknesses;

    @JsonProperty("improvement_suggestions")
    private List<String> improvementSuggestions;
}