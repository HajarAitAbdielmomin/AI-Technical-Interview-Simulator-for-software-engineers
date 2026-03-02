package com.techinterviewai.services;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.exceptions.UserAlreadyExistsException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.jwt.JwtResponse;

public interface UserService {
    public JwtResponse authenticateUser(UserSigninDto loginRequest)
            throws UserNotFoundException;
    boolean registerUser(UserSignupDto signupRequestDTO)
            throws UserAlreadyExistsException;
}
