package com.techinterviewai.services.implementation;

import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.exceptions.InterviewNotFoundException;
import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import com.techinterviewai.repository.InterviewRepository;
import com.techinterviewai.services.QuestionGenerationService;
import com.techinterviewai.util.PersonaPromptBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuestionGenerationServiceImpl implements QuestionGenerationService {
    private final ChatClient questionChatClient;
    private final PersonaPromptBuilder personaPromptBuilder;
    private final InterviewRepository interviewRepository;
    /**
     * Generates the next interview question based on:
     * - The interviewer persona (system prompt)
     * - Full Q&A history of the session (so AI never repeats)
     * - Current question number
     */
    public String generateNextQuestion(Interview interview, int questionNumber) {

        // 1. Build persona system prompt
        String systemPrompt = personaPromptBuilder.buildSystemPrompt(interview);

        // 2. Build message history from existing Q&A pairs
        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(systemPrompt));

        // Inject previous Q&A exchanges so AI has full context
        List<QuestionAnswer> history = interview.getQuestionAnswer();
        if (history != null) {
            for (QuestionAnswer qa : history) {
                // AI's previous question
                if (qa.getQuestion() != null) {
                    messages.add(new AssistantMessage(qa.getQuestion()));
                }
                // Candidate's answer (or skip marker if unanswered)
                if (qa.getUserAnswer() != null && !qa.getUserAnswer().isBlank()) {
                    messages.add(new UserMessage(qa.getUserAnswer()));
                }
            }
        }

        // 3. Trigger prompt for next question
        String trigger = buildTriggerMessage(questionNumber, interview.getQuestionAnswer().size());
        messages.add(new UserMessage(trigger));

        // 4. Call GPT-4o mini
        Prompt prompt = new Prompt(messages);
        return questionChatClient
                .prompt(prompt)
                .call()
                .content()
                .trim();
    }


     private String buildTriggerMessage(int questionNumber, int totalAsked) {
        if (questionNumber == 1) {
            return "Start the interview. Ask me the first question.";
        }
        return String.format(
                "Thank you for your answer. Please ask me question number %d of 8.",
                questionNumber
        );
    }
}
