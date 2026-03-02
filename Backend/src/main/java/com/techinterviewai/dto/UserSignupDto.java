package com.techinterviewai.dto;

import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.techinterviewai.models.User}
 */
@Value
public class UserSignupDto implements Serializable {
    String email;
    String password;
    String username;
}