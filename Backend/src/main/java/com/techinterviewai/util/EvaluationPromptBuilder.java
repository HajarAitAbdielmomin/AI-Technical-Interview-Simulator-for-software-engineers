package com.techinterviewai.util;

import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import org.springframework.stereotype.Component;

@Component
public class EvaluationPromptBuilder {
    public String buildSystemPrompt() {
        return """
            You are an expert technical interviewer evaluating a candidate's performance.
            
            Your job is to analyze ALL the questions and answers from the interview session
            and return a structured JSON evaluation. Be honest, specific, and constructive.
            
            RULES:
            - Respond ONLY with valid JSON. No preamble, no markdown, no explanation.
            - The score must be an integer between 0 and 100.
            - Each list must contain between 1 and 4 bullet points.
            - Be specific — reference actual answers, not generic feedback.
            """;
    }
    public String buildEvaluationPrompt(Interview interview) {
        StringBuilder sb = new StringBuilder();

        sb.append("Evaluate this technical interview session.\n\n");
        sb.append("Tech Stack: ").append(interview.getTechStack()).append("\n");
        sb.append("Level: ").append(interview.getLevel()).append("\n");
        sb.append("Interviewer style: ").append(interview.getInterviewerType()).append("\n\n");
        sb.append("=== INTERVIEW TRANSCRIPT ===\n\n");

        int i = 1;
        for (QuestionAnswer qa : interview.getQuestionAnswer()) {
            sb.append("Q").append(i).append(": ").append(qa.getQuestion()).append("\n");
            sb.append("A").append(i).append(": ");
            sb.append(qa.getUserAnswer() != null ? qa.getUserAnswer() : "[No answer provided]");
            sb.append("\n\n");
            i++;
        }

        sb.append("=== END TRANSCRIPT ===\n\n");
        sb.append("""
            Return ONLY this JSON structure:
            {
              "score": <integer 0-100>,
              "strengths": ["...", "..."],
              "weaknesses": ["...", "..."],
              "improvement_suggestions": ["...", "..."]
            }
            """);

        return sb.toString();
    }
}
