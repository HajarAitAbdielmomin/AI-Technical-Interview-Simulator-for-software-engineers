package com.techinterviewai.mappers;

import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.models.User;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    User toEntity(UserSignupDto userSignupDto);

    UserSignupDto toDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User partialUpdate(UserSignupDto userSignupDto, @MappingTarget User user);
}