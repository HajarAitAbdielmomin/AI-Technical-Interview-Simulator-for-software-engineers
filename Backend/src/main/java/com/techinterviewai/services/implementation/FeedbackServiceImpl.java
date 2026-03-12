package com.techinterviewai.services.implementation;

import com.techinterviewai.repository.FeedbackRepository;
import com.techinterviewai.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Override
    public List<Long> getUserStatistics(Long userId) {
        Long averageScore = feedbackRepository.findAvgScoreByUserId(userId);
        Long maxScore = feedbackRepository.findMaxScoreByUserId(userId);
        Long numInterviews = feedbackRepository.countInterviewsByUserId(userId);

       return List.of(averageScore, maxScore, numInterviews);
    }
}
