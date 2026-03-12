package com.techinterviewai.services;

import java.util.List;

public interface FeedbackService {
    List<Long> getUserStatistics(Long userId);
}
