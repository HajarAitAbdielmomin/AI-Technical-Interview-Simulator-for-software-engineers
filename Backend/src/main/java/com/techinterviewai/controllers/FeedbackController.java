package com.techinterviewai.controllers;

import com.techinterviewai.dto.feedbacksDto.FeedbackResponse;
import com.techinterviewai.services.InterviewService;
import com.techinterviewai.services.implementation.FeedbackServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {
    private final InterviewService interviewService;
    private final FeedbackServiceImpl feedbackService;

    @GetMapping("/{id}/feedback")
    public ResponseEntity<FeedbackResponse> getFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getFeedback(id));
    }

    @GetMapping("/user/{id}/statistics")
    public ResponseEntity<?> getUserStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getUserStatistics(id));
    }
}
