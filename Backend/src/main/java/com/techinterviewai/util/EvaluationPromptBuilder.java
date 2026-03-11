package com.techinterviewai.util;

import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import org.springframework.stereotype.Component;

@Component
public class EvaluationPromptBuilder {
    public String buildSystemPrompt() {
        return """
            You are a fair and balanced technical interviewer evaluating a candidate's performance.

            Your goal is to give an HONEST and ENCOURAGING evaluation not to find flaws at all costs.
            A good answer deserves a good score. Only penalize for genuine gaps or missing knowledge.

            SCORING GUIDE:
            - 90-100 : Excellent. Deep understanding, clear explanations, examples provided.
            - 75-89  : Good. Solid knowledge with minor gaps or missing details.
            - 60-74  : Average. Understands the basics but lacks depth or precision.
            - 40-59  : Below average. Partial understanding, significant gaps.
            - 0-39   : Poor. Incorrect, missing, or very shallow answers.

            EVALUATION RULES:
            - Be specific reference the candidate's actual words, not generic feedback.
            - If the candidate answered correctly, acknowledge it clearly in strengths.
            - Only list something as a weakness if it is genuinely missing or wrong.
            - Do NOT invent weaknesses just to appear thorough.
            - Do NOT penalize for not mentioning every possible edge case.
            - Improvement suggestions should be actionable and proportional to the score.
            - Respond ONLY with valid JSON. No preamble, no markdown, no explanation.
            - Do NOT wrap the response in ```json``` or any code block.
            - The score must be an integer between 0 and 100.
            - Each list must contain between 1 and 4 bullet points.
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
