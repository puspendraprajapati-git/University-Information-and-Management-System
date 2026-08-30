package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.university.dto.LoginRequestDTO;
import com.university.dto.LoginResponseDTO;
import com.university.dto.RegisterRequestDTO;
import com.university.dto.UserResponseDTO;
import com.university.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // dependency - constructor based D.I
    private final UserService userService;

    /*
     * URI - /api/auth/register
     * Method - POST
     * I/P - register req dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping("/register")
    @Operation(description = "Register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        System.out.println("in register user " + request.getUsername());
        return new ResponseEntity<>(userService.register(request), HttpStatus.CREATED);
    }

    /*
     * URI - /api/auth/login
     * Method - POST
     * I/P - login req dto
     * Success resp - SC 200 + token/response
     * Error resp - SC 401
     */
    @PostMapping("/login")
    @Operation(description = "Login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        System.out.println("in login user " + request.getEmail());
        return ResponseEntity.ok(userService.login(request));
    }

    /*
     * URI - /api/auth/users/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 + user resp dto
     * Error resp - SC 404
     */
    @GetMapping("/users/{id}")
    @Operation(description = "Get user by id")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        System.out.println("in get user " + id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /*
     * URI - /api/auth/users
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping("/users")
    @Operation(description = "Get all users")
    public ResponseEntity<?> getAllUsers() {
        System.out.println("in get all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /*
     * URI - /api/auth/users/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/users/{id}")
    @Operation(description = "Delete user")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        System.out.println("in delete user " + id);
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}