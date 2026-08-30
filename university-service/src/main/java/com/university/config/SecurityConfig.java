package com.university.config;

import com.university.security.CustomUserDetailsService;
import com.university.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        //1. disable CSRF protection
        http.csrf(AbstractHttpConfigurer::disable);
        
        //2. Disable HttpSession creation
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        // Disable CORS since the Node API Gateway handles it
        http.cors(AbstractHttpConfigurer::disable);

        /*
         * 4. Define URL based authorization rules
         * 4.1 public end points
         */
        http.authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/departments").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Admin-only endpoints for modifying departments and semesters
                .requestMatchers(HttpMethod.POST, "/api/departments/**", "/api/semesters/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/departments/**", "/api/semesters/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/departments/**", "/api/semesters/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/users/**").hasRole("ADMIN")

                // Faculty + Admin can manage subjects, attendance, results, events
                .requestMatchers(HttpMethod.POST, "/api/subjects/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/subjects/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/subjects/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/attendance/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/attendance/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/attendance/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/results/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/results/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/results/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyRole("ADMIN", "FACULTY")
                
                .requestMatchers(HttpMethod.POST, "/api/exams/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasAnyRole("ADMIN", "FACULTY")

                .requestMatchers(HttpMethod.POST, "/api/course-assignments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/course-assignments/**").hasRole("ADMIN")
                
                .requestMatchers(HttpMethod.POST, "/api/enrollments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/enrollments/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/fees/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/fees/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/fees/**").hasRole("ADMIN")

                // Admin manages students/faculty records, but users can create/update their own profiles
                .requestMatchers(HttpMethod.POST, "/api/students/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/faculty/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PUT, "/api/faculty/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/faculty/**").hasRole("ADMIN")

                // Everyone authenticated can GET (view) — attendance, results, events, subjects, students, faculty
                .requestMatchers(HttpMethod.GET, "/api/**").authenticated()

                // Anything else needs authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}