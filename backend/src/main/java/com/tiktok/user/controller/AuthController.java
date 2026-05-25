package com.tiktok.user.controller;

import com.tiktok.user.dto.CurrentUserResponse;
import com.tiktok.user.dto.LoginRequest;
import com.tiktok.user.dto.LoginResponse;
import com.tiktok.user.dto.LogoutResponse;
import com.tiktok.user.dto.RegisterRequest;
import com.tiktok.user.dto.RegisterResponse;
import com.tiktok.user.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "用户认证接口")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "退出登录")
    @PostMapping("/logout")
    public LogoutResponse logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return authService.logout(authorizationHeader);
    }

    @Operation(summary = "获取当前用户")
    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.getCurrentUser();
    }
}
