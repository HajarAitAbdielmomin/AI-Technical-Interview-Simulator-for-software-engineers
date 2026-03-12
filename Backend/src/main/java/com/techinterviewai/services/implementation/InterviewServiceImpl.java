package com.techinterviewai.services.implementation;

import com.techinterviewai.dto.feedbacksDto.FeedbackResponse;
import com.techinterviewai.dto.interviewsDto.*;
import com.techinterviewai.enums.Status;
import com.techinterviewai.exceptions.FeedbackNotAvailableException;
import com.techinterviewai.exceptions.PendingAnswerException;
import com.techinterviewai.exceptions.QuestionsOutOfBoundException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.mappers.*;
import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import com.techinterviewai.models.User;
import com.techinterviewai.repository.InterviewRepository;
import com.techinterviewai.repository.QuestionAnswerRepository;
import com.techinterviewai.repository.UserRepository;
import com.techinterviewai.services.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final QuestionAnswerMapper questionAnswerMapper;
    private final InterviewRepository interviewRepository;
    private final InterviewMapper interviewMapper;
    private final InterviewDetailsMapper interviewDetailsMapper;
    private final UserRepository userRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionGenerationServiceImpl questionGenerationService;
    private final FeedbackMapper feedbackMapper;
    private final EvaluationServiceImpl evaluationService;
    private final InterviewFeedbackMapper interviewFeedbackMapper;
    private final InterviewDataMapper interviewDataMapper;

    @Value("${app.interview.max-questions:8}")
    private int maxQuestions;

    @Override
    @Transactional
    public Long startInterview(InterviewDto interviewDto) {
        Interview interview = interviewMapper.toEntity(interviewDto);

        if(interview == null) return -1L;

        User user = userRepository.findById(interviewDto.getUserId()).orElseThrow(
                () -> new UserNotFoundException("User not found with id: " + interviewDto.getUserId())
        );

        interview.setUser(user);
        interview.setEndTime(LocalDateTime.now().plusMinutes(30));
        interview.setStatus(Status.IN_PROGRESS);


        interviewRepository.save(interview);

        return interviewRepository.save(interview).getId();
    }
    @Override
    public void validateNoPendingAnswer(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);
        boolean hasPending = interview.getQuestionAnswer().stream()
                .anyMatch(qa -> qa.getUserAnswer() == null || qa.getUserAnswer().isBlank());
        if (hasPending) {
            throw new PendingAnswerException(
                    "Please answer the current question before requesting the next one."
            );
        }
    }

    @Override
    public FeedbackResponse getFeedback(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);

        if (interview.getFeedback() == null) {
            throw new FeedbackNotAvailableException("Feedback not yet available for interview: " + interviewId);
        }

        return feedbackMapper.toDto(interview.getFeedback());
    }

    @Override
    @Transactional
    public QuestionAnswer submitAnswer(QuestionAnswerDto questionAnswerDto) {
        Interview interview = getInterviewEntity(questionAnswerDto.getInterviewId());

        QuestionAnswer pending = interview.getQuestionAnswer().stream()
                .filter(qa -> qa.getUserAnswer() == null || qa.getUserAnswer().isBlank())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No pending question found. Call /next-question first."
                ));

        pending.setUserAnswer(questionAnswerDto.getUserAnswer());
        return questionAnswerRepository.save(pending);

    }

    private Interview getInterviewEntity(Long id) {
        return interviewRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("Interview not found with id: " + id)
        );
    }

    @Override
    public InterviewDetailsDto getInterviewById(Long id) {
        Interview interview = getInterviewEntity(id);
        return interviewDetailsMapper.toDto(interview);
    }

    @Override
    @Transactional
    public String getNextQuestion(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);

        int questionNumber = interview.getQuestionAnswer().size() + 1;

        if (questionNumber > maxQuestions) {
            throw new QuestionsOutOfBoundException(
                    "Question number " + questionNumber + " exceeds maximum allowed questions.");
        }

        // Call GPT-4o mini with full message history
        String question = questionGenerationService.generateNextQuestion(interview, questionNumber);

        // Persist question row — userAnswer stays null until /answer is called
        QuestionAnswerDto qaDto = new QuestionAnswerDto();
        qaDto.setQuestion(question);
        qaDto.setUserAnswer(null);
        qaDto.setInterviewId(interviewId);
        
        QuestionAnswer qa = questionAnswerMapper.toEntity(qaDto);
        qa.setInterview(interview);
        questionAnswerRepository.save(qa);

        return question;
    }

    @Override
    public boolean isComplete(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);
        long answered = interview.getQuestionAnswer().stream()
                .filter(qa -> qa.getUserAnswer() != null && !qa.getUserAnswer().isBlank())
                .count();
        return answered >= maxQuestions;
    }

    @Override
    @Transactional
    public boolean endInterview(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);
        interview.setStatus(Status.COMPLETED);
        interview.setEndTime(LocalDateTime.now());
        interviewRepository.save(interview);
        // Pass only the ID — no entity crossing service boundaries
        evaluationService.evaluateInterview(interviewId);
        return true;
    }

    @Override
    public Long getRemainingTime(LocalDateTime startTime) {
        LocalDateTime now = LocalDateTime.now();
        long elapsedSeconds = Duration.between(startTime, now).getSeconds();
        long totalSeconds = 60 * 30;
        return Math.max(0, totalSeconds - elapsedSeconds);
    }

    @Override
    public ResumeInterviewResponseDto resumeInterview(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);
        
        long remainingSeconds = getRemainingTime(interview.getStartTime());
        
        return new ResumeInterviewResponseDto(
            interview.getId(),
            interview.getStatus(),
            interview.getTechStack(),
            interview.getInterviewerType(),
            interview.getLevel(),
            Math.max(0, remainingSeconds),
            interview.getQuestionAnswer().size(),
            maxQuestions,
            interview.getQuestionAnswer()
        );
    }

    @Override
    public int getQuestionCount(Long interviewId) {
        Interview interview = getInterviewEntity(interviewId);
        return interview.getQuestionAnswer().size();
    }

    @Override
    public List<InterviewFeedbackDto> getLastThreeCompletedInterviews(Long userId) {
        return interviewRepository.findTop3ByUserIdAndStatusOrderByEndTimeDesc(userId, Status.COMPLETED)
                .stream()
                .map(interviewFeedbackMapper::toDto)
                .toList();
    }

    @Override
    public List<InterviewDataDto> getAllInterviewsByUser(Long userId) {
        return interviewRepository.findByUserId(userId).stream()
                .map(interviewDataMapper::toDto)
                .toList();
    }
}
