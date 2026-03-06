package com.techinterviewai.handlers;

import com.techinterviewai.exceptions.InterviewNotFoundException;
import com.techinterviewai.exceptions.PendingAnswerException;
import com.techinterviewai.exceptions.QuestionsOutOfBoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InterviewExceptionHandler {
    @ExceptionHandler(InterviewNotFoundException.class)
    public ResponseEntity<String> handleInterviewNotFoundException(InterviewNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(QuestionsOutOfBoundException.class)
    public ResponseEntity<String> handleQuestionsOutOfBoundException(QuestionsOutOfBoundException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(PendingAnswerException.class)
    public ResponseEntity<String> handlePendingAnswerException(PendingAnswerException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
