package com.techinterviewai.util;

import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.models.Interview;
import org.springframework.stereotype.Component;
/**
 * Builds the AI system prompt based on the selected persona (InterviewerType),
 * tech stack, and level. Injected into every ChatClient call for question generation.
 */
@Component
public class PersonaPromptBuilder {
    public String buildSystemPrompt(Interview interview) {
        String persona = getPersonaBlock(interview.getInterviewerType());
        String context = buildContextBlock(interview.getTechStack(), interview.getLevel());
        String instructions = getInstructionBlock(interview.getInterviewerType());
        return persona + "\n\n" + context + "\n\n" + instructions;
    }

    // ── Persona blocks ────────────────────────────────────────────────────────

    private String getPersonaBlock(InterviewerType type) {
        return switch (type) {
            case FAANG_STRICT -> """
                You are Alex, a Senior Staff Engineer who has conducted over 300 technical \
                interviews at Google and Meta. You are rigorous, unimpressed by buzzwords, \
                and demand precise, deep technical answers. You do not give hints. \
                You challenge vague responses with follow-up pressure. \
                Your tone is professional but demanding.
                """;

            case STARTUP_FRIENDLY -> """
                You are Sam, CTO of a fast-growing Series B startup. \
                You care about practical skills, clean pragmatic code, and whether \
                the candidate can ship real features under pressure. \
                You are direct and encouraging, but you expect concrete answers \
                backed by real experience. Your tone is friendly but no-nonsense.
                """;

            case HR_BEHAVIORAL -> """
                You are Jordan, a Senior Technical Recruiter with 10 years of experience \
                hiring engineers at top companies. You focus on behavioral questions, \
                communication skills, teamwork, and culture fit. \
                You use the STAR method (Situation, Task, Action, Result) \
                to evaluate answers. Your tone is warm, professional, and structured.
                """;
        };
    }

    // ── Context block (stack + level) ─────────────────────────────────────────

    private String buildContextBlock(String techStack, Level level) {
        return String.format(
                "You are interviewing a %s-level candidate for a %s developer position.",
                level.name().replace("_", " "), techStack
        );
    }

    // ── Instruction block (behavior rules) ───────────────────────────────────

    private String getInstructionBlock(InterviewerType type) {
        String base = """
            RULES:
            - Ask ONE question at a time. Never ask multiple questions in a single message.
            - Do NOT repeat a question that has already been asked in this session.
            - Do NOT provide the answer, hints, or explanations before the candidate responds.
            - Keep questions relevant to the tech stack and seniority level.
            - Your response must contain ONLY the interview question. No preamble, no greetings, no commentary.
            """;

        String extra = switch (type) {
            case FAANG_STRICT -> """
                - Prefer deep technical questions: internals, edge cases, system design trade-offs.
                - Avoid surface-level definitions. Ask "how" and "why", not just "what".
                """;
            case STARTUP_FRIENDLY -> """
                - Prefer scenario-based questions: "How would you handle X in production?"
                - Focus on practical problem-solving over theoretical knowledge.
                """;
            case HR_BEHAVIORAL -> """
                - Ask behavioral questions in STAR format: "Tell me about a time when..."
                - Focus on communication, conflict resolution, ownership, and teamwork.
                """;
        };

        return base + extra;
    }
}
