package com.techinterviewai.mappers;

import com.techinterviewai.dto.interviewsDto.InterviewFeedbackDto;
import com.techinterviewai.models.Feedback;
import com.techinterviewai.models.Interview;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface InterviewFeedbackMapper {
    Interview toEntity(InterviewFeedbackDto interviewFeedbackDto);

    @AfterMapping
    default void linkFeedback(@MappingTarget Interview interview) {
        Feedback feedback = interview.getFeedback();
        if (feedback != null) {
            feedback.setInterview(interview);
        }
    }

    InterviewFeedbackDto toDto(Interview interview);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Interview partialUpdate(InterviewFeedbackDto interviewFeedbackDto, @MappingTarget Interview interview);
}