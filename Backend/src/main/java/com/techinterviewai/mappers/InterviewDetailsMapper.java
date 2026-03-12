package com.techinterviewai.mappers;

import com.techinterviewai.dto.interviewsDto.InterviewDetailsDto;
import com.techinterviewai.models.Interview;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface InterviewDetailsMapper {
    InterviewDetailsDto toDto(Interview interview);
    
    Interview toEntity(InterviewDetailsDto interviewDetailsDto);
}
