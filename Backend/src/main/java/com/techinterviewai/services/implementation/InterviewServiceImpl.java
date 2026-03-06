package com.techinterviewai.services.implementation;

import com.techinterviewai.dto.SubmitAnswerResponseDto;
import com.techinterviewai.dto.NextQuestionResponseDto;
import com.techinterviewai.dto.QuestionAnswerDto;
import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.enums.Status;
import com.techinterviewai.exceptions.QuestionsOutOfBoundException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.mappers.QuestionAnswerMapper;
import com.techinterviewai.mappers.InterviewMapper;
import com.techinterviewai.models.Interview;
import com.techinterviewai.models.QuestionAnswer;
import com.techinterviewai.models.User;
import com.techinterviewai.repository.InterviewRepository;
import com.techinterviewai.repository.QuestionAnswerRepository;
import com.techinterviewai.repository.UserRepository;
import com.techinterviewai.services.InterviewService;
import com.techinterviewai.services.QuestionGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final QuestionAnswerMapper questionAnswerMapper;
    private final InterviewRepository interviewRepository;
    private final InterviewMapper interviewMapper;
    private final UserRepository userRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionGenerationServiceImpl questionGenerationService;

    @Value("${app.interview.max-questions:8}")
    private int maxQuestions;

    @Override
    @Transactional
    public boolean startInterview(InterviewDto interviewDto) {
        Interview interview = interviewMapper.toEntity(interviewDto);

        if(interview == null) return false;

        User user = userRepository.findById(interviewDto.getUserId()).orElseThrow(
                () -> new UserNotFoundException("User not found with id: " + interviewDto.getUserId())
        );

        interview.setUser(user);
        interview.setStatus(Status.IN_PROGRESS);

        //System.out.println("Saving interview : " + interview);

        interviewRepository.save(interview);

        return true;
    }
    @Override
    public void validateNoPendingAnswer(Long interviewId) {
        Interview interview = getInterviewById(interviewId);
        boolean hasPending = interview.getQuestionAnswer().stream()
                .anyMatch(qa -> qa.getUserAnswer() == null || qa.getUserAnswer().isBlank());
        if (hasPending) {
            throw new IllegalStateException(
                    "Please answer the current question before requesting the next one."
            );
        }
    }


    @Override
    @Transactional
    public QuestionAnswer submitAnswer(QuestionAnswerDto questionAnswerDto) {
        Interview interview = getInterviewById(questionAnswerDto.getInterviewId());

        QuestionAnswer pending = interview.getQuestionAnswer().stream()
                .filter(qa -> qa.getUserAnswer() == null || qa.getUserAnswer().isBlank())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No pending question found. Call /next-question first."
                ));

        pending.setUserAnswer(questionAnswerDto.getUserAnswer());
        return questionAnswerRepository.save(pending);

    }

    @Override
    public Interview getInterviewById(Long id) {
        return interviewRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("Interview not found with id: " + id)
        );
    }

    @Override
    @Transactional
    public String getNextQuestion(Long interviewId) {
        Interview interview = getInterviewById(interviewId);

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
        Interview interview = getInterviewById(interviewId);
        long answered = interview.getQuestionAnswer().stream()
                .filter(qa -> qa.getUserAnswer() != null && !qa.getUserAnswer().isBlank())
                .count();
        return answered >= maxQuestions;
    }

    @Override
    public boolean endInterview(Long interviewId) {
        Interview interview = getInterviewById(interviewId);
        interview.setStatus(Status.COMPLETED);
        interview.setEndTime(LocalDateTime.now());
        return false;
    }



}
