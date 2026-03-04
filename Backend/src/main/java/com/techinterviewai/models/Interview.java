package com.techinterviewai.models;
import com.techinterviewai.enums.InterviewerType;
import com.techinterviewai.enums.Level;
import com.techinterviewai.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "interviews")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interview {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String techStack;
	@Enumerated(EnumType.STRING)
	private InterviewerType interviewerType;
	@Enumerated(EnumType.STRING)
	private Level level;
	@Enumerated(EnumType.STRING)
	private Status status;
	@CreatedDate
	private LocalDateTime startTime;

	private LocalDateTime endTime;
	@ManyToOne
	@JoinColumn(name = "user_id")
	public User user;
	@OneToOne(mappedBy = "interview", cascade = CascadeType.ALL)
	public Feedback feedback;
	@OneToMany(mappedBy = "interview", cascade = CascadeType.ALL)
	public List<QuestionAnswer> questionAnswer = new ArrayList<>();
}

