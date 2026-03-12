package com.techinterviewai.repository;

import com.techinterviewai.models.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @Query("SELECT MAX(f.score) FROM Feedback f WHERE f.interview.user.id = :userId")
    Long findMaxScoreByUserId(Long userId);
    
    @Query("SELECT AVG(f.score) FROM Feedback f WHERE f.interview.user.id = :userId")
    Long findAvgScoreByUserId(Long userId);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.interview.user.id = :userId")
    Long countInterviewsByUserId(Long userId);
}
