package com.techinterviewai.repository;

import com.techinterviewai.enums.Status;
import com.techinterviewai.models.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findTop3ByUserIdAndStatusOrderByEndTimeDesc(Long userId, Status status);
    List<Interview> findByUserId(Long userId);

}
