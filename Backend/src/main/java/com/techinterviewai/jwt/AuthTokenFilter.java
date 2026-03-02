package com.techinterviewai.jwt;

import com.techinterviewai.services.implementation.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {
    //Service for JWT operations
    private final Jwt jwt;
    private final UserDetailsServiceImpl userDetailsService;


    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwtToken = parseJwt(request);

                if (jwtToken != null && jwt.validateJwtToken(jwtToken)) {

                    String username = jwt.getUserNameFromJwtToken(jwtToken);

                    //Loads user details from your database
                    assert userDetailsService != null;
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    authentication.setDetails( //Extracts details from the HTTP request
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    //Stores the authentication object in the Security Context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        //Passes the request and response to the next filter in the chain
        filterChain.doFilter(request, response);
    }

    //Gets the JWT token from the request(the Authorization header)
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }


}
