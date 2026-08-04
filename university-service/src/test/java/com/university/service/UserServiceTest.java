//package com.university.service;
//
//import com.university.dto.LoginRequestDTO;
//import com.university.dto.RegisterRequestDTO;
//import com.university.dto.UserResponseDTO;
//import com.university.entity.Users;
//import com.university.enums.Role;
//import com.university.exception.DuplicateResourceException;
//import com.university.exception.InvalidCredentialsException;
//import com.university.exception.ResourceNotFoundException;
//import com.university.repository.UsersRepository;
//import com.university.service.impl.UserServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class UserServiceTest {
//
//    @Mock
//    private UsersRepository usersRepository;
//
//    private UserServiceImpl userService;
//
//    private PasswordEncoder passwordEncoder;
//
//    private Users user;
//
//
//    @BeforeEach
//    void setUp() {
//
//        passwordEncoder = new BCryptPasswordEncoder();
//
//        userService = new UserServiceImpl(
//                usersRepository,
//                passwordEncoder
//        );
//
//
//        user = Users.builder()
//                .userId(1L)
//                .username("admin1")
//                .password(passwordEncoder.encode("admin123"))
//                .email("admin1@university.com")
//                .role(Role.ADMIN)
//                .build();
//    }
//
//
//    @Test
//    void register_success() {
//
//        RegisterRequestDTO request = new RegisterRequestDTO();
//
//        request.setUsername("newuser");
//        request.setPassword("password123");
//        request.setEmail("new@university.com");
//        request.setRole(Role.STUDENT);
//
//
//        when(usersRepository.findByUsername("newuser"))
//                .thenReturn(null);
//
//        when(usersRepository.findByEmail("new@university.com"))
//                .thenReturn(null);
//
//        when(usersRepository.save(any(Users.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//
//        UserResponseDTO result =
//                userService.register(request);
//
//
//        assertThat(result).isNotNull();
//        assertThat(result.getUsername())
//                .isEqualTo("newuser");
//
//
//        verify(usersRepository)
//                .save(any(Users.class));
//    }
//
//
//    @Test
//    void register_duplicateUsername_throwsException() {
//
//        RegisterRequestDTO request = new RegisterRequestDTO();
//
//        request.setUsername("admin1");
//        request.setPassword("password123");
//        request.setEmail("new@university.com");
//        request.setRole(Role.ADMIN);
//
//
//        when(usersRepository.findByUsername("admin1"))
//                .thenReturn(user);
//
//
//        assertThatThrownBy(() ->
//                userService.register(request))
//
//                .isInstanceOf(DuplicateResourceException.class)
//                .hasMessageContaining("Username already exists");
//
//
//        verify(usersRepository, never())
//                .save(any());
//    }
//
//
//
//    @Test
//    void register_duplicateEmail_throwsException() {
//
//        RegisterRequestDTO request = new RegisterRequestDTO();
//
//        request.setUsername("newuser");
//        request.setPassword("password123");
//        request.setEmail("admin1@university.com");
//        request.setRole(Role.STUDENT);
//
//
//        when(usersRepository.findByUsername("newuser"))
//                .thenReturn(null);
//
//        when(usersRepository.findByEmail("admin1@university.com"))
//                .thenReturn(user);
//
//
//
//        assertThatThrownBy(() ->
//                userService.register(request))
//
//                .isInstanceOf(DuplicateResourceException.class)
//                .hasMessageContaining("Email already exists");
//    }
//
//
//
//    @Test
//    void login_correctCredentials_success() {
//
//        LoginRequestDTO request = new LoginRequestDTO();
//
//        request.setUsername("admin1");
//        request.setPassword("admin123");
//
//
//        when(usersRepository.findByUsername("admin1"))
//                .thenReturn(user);
//
//
//        UserResponseDTO result =
//                userService.login(request);
//
//
//        assertThat(result)
//                .isNotNull();
//
//        assertThat(result.getUsername())
//                .isEqualTo("admin1");
//    }
//
//
//
//
//    @Test
//    void login_wrongPassword_throwsException() {
//
//        LoginRequestDTO request = new LoginRequestDTO();
//
//        request.setUsername("admin1");
//        request.setPassword("wrongpassword");
//
//
//        when(usersRepository.findByUsername("admin1"))
//                .thenReturn(user);
//
//
//
//        assertThatThrownBy(() ->
//                userService.login(request))
//
//                .isInstanceOf(InvalidCredentialsException.class);
//    }
//
//
//
//
//    @Test
//    void login_userNotFound_throwsException() {
//
//
//        LoginRequestDTO request = new LoginRequestDTO();
//
//        request.setUsername("unknown");
//        request.setPassword("password");
//
//
//        when(usersRepository.findByUsername("unknown"))
//                .thenReturn(null);
//
//
//
//        assertThatThrownBy(() ->
//                userService.login(request))
//
//                .isInstanceOf(InvalidCredentialsException.class);
//    }
//
//
//
//
//
//    @Test
//    void getUserById_success() {
//
//
//        when(usersRepository.findById(1L))
//                .thenReturn(Optional.of(user));
//
//
//        UserResponseDTO result =
//                userService.getUserById(1L);
//
//
//        assertThat(result.getUsername())
//                .isEqualTo("admin1");
//    }
//
//
//
//
//
//    @Test
//    void getUserById_notFound_throwsException() {
//
//
//        when(usersRepository.findById(99L))
//                .thenReturn(Optional.empty());
//
//
//        assertThatThrownBy(() ->
//                userService.getUserById(99L))
//
//                .isInstanceOf(ResourceNotFoundException.class);
//    }
//
//
//
//
//
//    @Test
//    void getAllUsers_success() {
//
//
//        when(usersRepository.findAll())
//                .thenReturn(List.of(user));
//
//
//        List<UserResponseDTO> result =
//                userService.getAllUsers();
//
//
//        assertThat(result)
//                .hasSize(1);
//
//        assertThat(result.get(0).getUsername())
//                .isEqualTo("admin1");
//    }
//
//
//
//
//
//    @Test
//    void deleteUser_success() {
//
//
//        when(usersRepository.existsById(1L))
//                .thenReturn(true);
//
//
//        userService.deleteUser(1L);
//
//
//        verify(usersRepository)
//                .deleteById(1L);
//    }
//
//
//
//
//
//    @Test
//    void deleteUser_notFound_throwsException() {
//
//
//        when(usersRepository.existsById(99L))
//                .thenReturn(false);
//
//
//        assertThatThrownBy(() ->
//                userService.deleteUser(99L))
//
//                .isInstanceOf(ResourceNotFoundException.class);
//
//
//        verify(usersRepository, never())
//                .deleteById(any());
//    }
//}
