package com.techinterviewai.services.implementation;

import com.techinterviewai.dto.UserSigninDto;
import com.techinterviewai.dto.UserSignupDto;
import com.techinterviewai.exceptions.UserAlreadyExistsException;
import com.techinterviewai.exceptions.UserNotFoundException;
import com.techinterviewai.jwt.Jwt;
import com.techinterviewai.jwt.JwtResponse;
import com.techinterviewai.mappers.UserMapper;
import com.techinterviewai.mappers.UserSigninMapper;
import com.techinterviewai.models.User;
import com.techinterviewai.repository.UserRepository;
import com.techinterviewai.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final Jwt jwt;
    private final UserMapper userMapper;
    private final UserSigninMapper userSigninMapper;

    @Override
    public boolean registerUser(UserSignupDto signupRequestDTO) throws UserAlreadyExistsException {
        if(userRepository.existsUserByEmailOrUsername(signupRequestDTO.getEmail(), signupRequestDTO.getUsername()))
            throw new UserAlreadyExistsException("User already exists");

        User user= userMapper.toEntity(signupRequestDTO);
        user.setPassword(encoder.encode(user.getPassword()));

        userRepository.save(user);
        return true;
    }

    @Override
    public JwtResponse authenticateUser(UserSigninDto loginRequest)
            throws UserNotFoundException
    {
        if(!userRepository.existsUserByEmailOrUsername(loginRequest.getEmail(), null))
            throw new UserNotFoundException("User not found");

        User user = userSigninMapper.toEntity(loginRequest);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

        //This allows other parts of the application to access the authenticated user's details.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        //generate a JWT token for the authenticated user
        String jwt = this.jwt.generateJwtToken(authentication);

        //The identity of the principal being authenticated
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        //returning response containing the user's information and the generated JWT
        return JwtResponse.builder()
                .id(userDetails.getId())
                .token(jwt)
                .email(userDetails.getUsername())
                .build();
    }
}
