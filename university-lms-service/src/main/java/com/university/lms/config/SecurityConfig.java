package com.university.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(AbstractHttpConfigurer::disable);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/error").permitAll()
                // Download endpoints can be accessed with token or permit
                .requestMatchers(
                        "/lms/submissions/download/**", "/lms/resources/download/**",
                        "/submissions/download/**", "/resources/download/**"
                ).permitAll()
                // Assignments:
                .requestMatchers(HttpMethod.POST, "/lms/assignments/**", "/assignments/**").hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/lms/assignments/**", "/assignments/**").hasAnyRole("FACULTY", "ADMIN")
                // Evaluations:
                .requestMatchers(HttpMethod.POST, "/lms/evaluations/**", "/evaluations/**").hasAnyRole("FACULTY", "ADMIN")
                // Resources:
                .requestMatchers(HttpMethod.POST, "/lms/resources/**", "/resources/**").hasAnyRole("FACULTY", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/lms/resources/**", "/resources/**").hasAnyRole("FACULTY", "ADMIN")
                // Submissions:
                .requestMatchers(HttpMethod.POST, "/lms/submissions/**", "/submissions/**").hasAnyRole("STUDENT", "ADMIN")
                // Any other LMS endpoint:
                .requestMatchers(
                        "/lms/**", "/assignments/**", "/submissions/**",
                        "/evaluations/**", "/resources/**"
                ).authenticated()
                .anyRequest().permitAll()
        );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
