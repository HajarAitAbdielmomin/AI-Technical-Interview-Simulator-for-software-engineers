package com.techinterviewai.mappers;

import com.techinterviewai.dto.QuestionAnswerDto;
import com.techinterviewai.models.QuestionAnswer;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuestionAnswerMapper {
    QuestionAnswer toEntity(QuestionAnswerDto questionAnswerDto);

    QuestionAnswerDto toDto(QuestionAnswer questionAnswer);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    QuestionAnswer partialUpdate(QuestionAnswerDto questionAnswerDto, @MappingTarget QuestionAnswer questionAnswer);
}