package com.techinterviewai.services;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.exceptions.UserAlreadyExistsException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.jwt.JwtResponse;

public interface UserService {
     JwtResponse authenticateUser(UserSigninDto loginRequest)
            throws UserNotFoundException;
    void registerUser(UserSignupDto signupRequestDTO)
            throws UserAlreadyExistsException;
}
