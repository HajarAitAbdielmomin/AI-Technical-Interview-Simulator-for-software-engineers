package com.techinterviewai.controllers;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.exceptions.UserAlreadyExistsException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.services.implementation.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userService;

    @PostMapping("/auth/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody UserSigninDto loginRequest)
            throws UserNotFoundException {
        return ResponseEntity.ok(userService.authenticateUser(loginRequest));
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserSignupDto signupRequestDTO)
            throws UserAlreadyExistsException {
        userService.registerUser(signupRequestDTO);
        return ResponseEntity.ok("User registered successfully");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userService.removeUser(id) ?
                ResponseEntity.ok("User deleted successfully") :
                ResponseEntity.badRequest().body("User deletion failed");
    }

}
