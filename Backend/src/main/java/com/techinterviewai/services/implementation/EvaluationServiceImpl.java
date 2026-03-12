package com.techinterviewai.services.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techinterviewai.dto.feedbacksDto.EvaluationResult;
import com.techinterviewai.dto.feedbacksDto.FeedbackResponse;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.mappers.FeedbackMapper;
import com.techinterviewai.models.Feedback;
import com.techinterviewai.models.Interview;
import com.techinterviewai.repository.FeedbackRepository;
import com.techinterviewai.repository.InterviewRepository;
import com.techinterviewai.services.EvaluationService;
import com.techinterviewai.util.EvaluationPromptBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Slf4j
public class EvaluationServiceImpl implements EvaluationService {

    private final InterviewRepository interviewRepository;
    private final ChatClient evaluationChatClient;
    private final EvaluationPromptBuilder evaluationPromptBuilder;
    private final FeedbackRepository feedbackRepository;
    private final ObjectMapper objectMapper;
    private final FeedbackMapper feedbackMapper;


    @Override
    @Transactional
    public FeedbackResponse evaluateInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId).orElseThrow(
                () -> new UserNotFoundException("Interview not found with id: " + interviewId)
        );

        String systemPrompt = evaluationPromptBuilder.buildSystemPrompt();
        String userPrompt   = evaluationPromptBuilder.buildEvaluationPrompt(interview);

        String rawJson = evaluationChatClient
                .prompt(new Prompt(List.of(
                        new SystemMessage(systemPrompt),
                        new UserMessage(userPrompt)
                )))
                .options(OpenAiChatOptions.builder()
                        .withModel("openai-gpt-oss-120b")
                        .withTemperature(0.4)
                        .build())
                .call()
                .content();
        log.debug("Raw evaluation JSON from AI: {}", rawJson);
        EvaluationResult result = parseEvaluationResult(rawJson);
        Feedback feedback = new Feedback();
        feedback.setInterview(interview);
        feedback.setScore(result.getScore().doubleValue());
        feedback.setStrengths(String.join("||", result.getStrengths()));
        feedback.setWeaknesses(String.join("||", result.getWeaknesses()));
        feedback.setImprovementsSuggestions(String.join("||", result.getImprovementSuggestions()));
        feedbackRepository.save(feedback);

        // 6. Return DTO — entity stays in service layer
        return feedbackMapper.toDto(feedback);
    }

    private EvaluationResult parseEvaluationResult(String rawJson) {
        try {
            String clean = rawJson
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();
            return objectMapper.readValue(clean, EvaluationResult.class);
        } catch (Exception e) {
            log.error("Failed to parse evaluation JSON: {}", rawJson, e);
            // Safe fallback — never crash the end-interview flow
            EvaluationResult fallback = new EvaluationResult();
            fallback.setScore(0);
            fallback.setStrengths(List.of("Unable to evaluate responses"));
            fallback.setWeaknesses(List.of("Evaluation parsing failed"));
            fallback.setImprovementSuggestions(List.of("Please contact support"));
            return fallback;
        }
    }
}
