package com.techinterviewai.mappers;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.models.User;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserSigninMapper {
    User toEntity(UserSigninDto userSigninDto);

    UserSigninDto toDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserSigninDto userSigninDto, @MappingTarget User user);
}