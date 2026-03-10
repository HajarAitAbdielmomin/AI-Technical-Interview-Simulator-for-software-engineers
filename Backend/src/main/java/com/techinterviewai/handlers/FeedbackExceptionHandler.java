package com.techinterviewai.handlers;

import com.techinterviewai.exceptions.FeedbackNotAvailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class FeedbackExceptionHandler {

@ExceptionHandler(FeedbackNotAvailableException.class)
    public ResponseEntity<String> handleFeedbackNotFoundException(FeedbackNotAvailableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
