package com.techinterviewai.mappers;

import com.techinterviewai.dto.FeedbackResponse;
import com.techinterviewai.models.Feedback;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface FeedbackMapper {
    Feedback toEntity(FeedbackResponse feedbackResponse);

    FeedbackResponse toDto(Feedback feedback);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Feedback partialUpdate(FeedbackResponse feedbackResponse, @MappingTarget Feedback feedback);
}