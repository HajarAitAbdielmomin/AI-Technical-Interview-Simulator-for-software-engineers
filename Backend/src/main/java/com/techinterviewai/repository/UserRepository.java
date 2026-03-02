package com.techinterviewai.repository;

import com.techinterviewai.models.User;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsUserByEmailOrUsername(String email, String username);
    Optional<User> findByEmail(String email);
}
