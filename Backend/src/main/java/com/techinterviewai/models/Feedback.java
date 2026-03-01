package com.techinterviewai.models;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(columnDefinition = "TEXT")
	private String strengths;
	@Column(columnDefinition = "TEXT")
	private String weaknesses;
	@Column(columnDefinition = "TEXT")
	private String improvementsSuggestions;
	private Double score;
	@OneToOne
	@JoinColumn(name = "interview_id")
	public Interview interview;
}