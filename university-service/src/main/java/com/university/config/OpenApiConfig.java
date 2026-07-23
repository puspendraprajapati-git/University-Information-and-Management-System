package com.university.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI universityOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("University Information & Management System API")
                        .description("REST API for managing Departments, Students, Faculty, Semesters, "
                                + "Subjects, Attendance, Results, and Events/News/Syllabus.")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("University Dev Team")
                                .email("dev@university.com")));
    }
}