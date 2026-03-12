package com.techinterviewai.mappers;

import com.techinterviewai.dto.interviewsDto.InterviewDataDto;
import com.techinterviewai.models.Feedback;
import com.techinterviewai.models.Interview;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface InterviewDataMapper {
    Interview toEntity(InterviewDataDto interviewDataDto);

    @AfterMapping
    default void linkFeedback(@MappingTarget Interview interview) {
        Feedback feedback = interview.getFeedback();
        if (feedback != null) {
            feedback.setInterview(interview);
        }
    }

    @AfterMapping
    default void linkQuestionAnswer(@MappingTarget Interview interview) {
        interview.getQuestionAnswer().forEach(questionAnswer -> questionAnswer.setInterview(interview));
    }

    InterviewDataDto toDto(Interview interview);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Interview partialUpdate(InterviewDataDto interviewDataDto, @MappingTarget Interview interview);
}