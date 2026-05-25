package com.tiktok.user.controller;

import com.tiktok.common.auth.UserContext;
import com.tiktok.user.dto.CurrentUserResponse;
import com.tiktok.user.dto.LoginRequest;
import com.tiktok.user.dto.LoginResponse;
import com.tiktok.user.dto.RegisterRequest;
import com.tiktok.user.dto.RegisterResponse;
import com.tiktok.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        CurrentUserResponse response = new CurrentUserResponse();
        response.setUserId(UserContext.getCurrentUserId());
        response.setUsername(UserContext.getCurrentUsername());
        response.setRole(UserContext.getCurrentRole());
        return response;
    }
}
