package com.techinterviewai.mappers;

import com.techinterviewai.dto.InterviewDto;
import com.techinterviewai.models.Interview;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface InterviewMapper {
    Interview toEntity(InterviewDto interviewDto);

    InterviewDto toDto(Interview interview);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Interview partialUpdate(InterviewDto interviewDto, @MappingTarget Interview interview);
}