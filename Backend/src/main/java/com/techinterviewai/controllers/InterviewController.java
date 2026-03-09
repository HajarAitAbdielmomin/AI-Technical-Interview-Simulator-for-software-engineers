package com.techinterviewai.controllers;

import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.dto.InterviewDetailsDto;
import com.techinterviewai.dto.QuestionAnswerDto;
import com.techinterviewai.models.QuestionAnswer;
import com.techinterviewai.services.implementation.InterviewServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewServiceImpl interviewService;
    @Value("${app.interview.max-questions:8}")
    private int maxQuestions;

    @Value("${app.interview.duration-minutes:25}")
    private int durationMinutes;

    @PostMapping("/start")
    public ResponseEntity<?> startInterview(@Valid @RequestBody InterviewDto interviewDto) {
        return ResponseEntity.ok(interviewService.startInterview(interviewDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }

    @GetMapping("/{id}/next-question")
    public ResponseEntity<?> nextQuestion(@PathVariable Long id) {
        interviewService.validateNoPendingAnswer(id);
        String question = interviewService.getNextQuestion(id);

        int questionNumber = interviewService.getQuestionCount(id);
        boolean isLast = questionNumber >= maxQuestions;

        return ResponseEntity.ok(Map.of(
                "question",       question,
                "questionNumber", questionNumber,
                "totalQuestions", maxQuestions,
                "isLastQuestion", isLast
        ));
    }

    @PostMapping("/answer")
    public ResponseEntity<?> submitAnswer(@Valid @RequestBody QuestionAnswerDto questionAnswerDto) {
        QuestionAnswer saved = interviewService.submitAnswer(questionAnswerDto);
        boolean complete = interviewService.isComplete(questionAnswerDto.getInterviewId());

        return ResponseEntity.ok(Map.of(
                "questionAnswerId",  saved.getId(),
                "question",          saved.getQuestion(),
                "userAnswer",        saved.getUserAnswer(),
                "interviewComplete", complete
        ));
    }

    @GetMapping("/{id}/end")
    public ResponseEntity<?> endInterview(@PathVariable Long id) {
        return interviewService.endInterview(id) ?
                ResponseEntity.ok().body("Interview ended successfully"):
                ResponseEntity.badRequest().body("Failed to end interview");
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<?> resumeInterview(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.resumeInterview(id));
    }
}
