package com.techinterviewai.controllers;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.exceptions.UserAlreadyExistsException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.mappers.UserSigninMapper;
import com.techinterviewai.services.implementation.AuthServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final AuthServiceImpl authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody UserSigninDto loginRequest)
            throws UserNotFoundException {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserSignupDto signupRequestDTO)
            throws UserAlreadyExistsException {
        authService.registerUser(signupRequestDTO);
        return ResponseEntity.ok("User registered successfully");
    }


}
