package com.techinterviewai.services;

import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.models.Interview;

/**
 * Handles AI question generation using GPT-4o mini via Spring AI.
 * Maintains full message history per session so the AI never repeats questions.
 */
public interface QuestionGenerationService {
    String generateNextQuestion(Interview interview, int questionNumber);
}
