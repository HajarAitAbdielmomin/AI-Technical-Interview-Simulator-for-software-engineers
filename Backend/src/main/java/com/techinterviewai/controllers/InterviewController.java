package com.techinterviewai.controllers;

import com.techinterviewai.dto.SubmitAnswerResponseDto;
import com.techinterviewai.dto.NextQuestionResponseDto;
import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import com.techinterviewai.services.implementation.InterviewServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

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
        return interviewService.startInterview(interviewDto) ?
                ResponseEntity.ok().body("Interview started successfully"):
                ResponseEntity.badRequest().body("Failed to start interview");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }

    @PostMapping("/{id}/next-question")
    public ResponseEntity<?> nextQuestion(@PathVariable Long id) {
        interviewService.validateNoPendingAnswer(id);
        return ResponseEntity.ok(interviewService.getNextQuestion(id));
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> submitAnswer(@PathVariable Long id, @Valid @RequestBody String req) {
        return ResponseEntity.ok(interviewService.submitAnswer(id, req));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> endInterview(@PathVariable Long id) {
        return interviewService.endInterview(id) ?
                ResponseEntity.ok().body("Interview ended successfully"):
                ResponseEntity.badRequest().body("Failed to end interview");
    }
}
