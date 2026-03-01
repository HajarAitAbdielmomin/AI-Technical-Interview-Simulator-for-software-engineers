package com.techinterviewai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@ComponentScan(basePackages = "com.techinterviewai.*")
public class TechInterviewAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TechInterviewAiApplication.class, args);
    }

}
