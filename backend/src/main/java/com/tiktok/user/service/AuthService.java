package com.tiktok.user.service;

import com.tiktok.common.auth.JwtUtil;
import com.tiktok.common.auth.UserContext;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.user.dto.LoginRequest;
import com.tiktok.user.dto.LoginResponse;
import com.tiktok.user.dto.LogoutResponse;
import com.tiktok.user.dto.RegisterRequest;
import com.tiktok.user.dto.RegisterResponse;
import com.tiktok.user.entity.TokenBlacklist;
import com.tiktok.user.entity.User;
import com.tiktok.user.mapper.TokenBlacklistMapper;
import com.tiktok.user.mapper.UserMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final String DEFAULT_STATUS = "ACTIVE";
    private static final String BANNED_STATUS = "BANNED";
    private static final String DEFAULT_ROLE = "USER";
    private static final String INVALID_CREDENTIALS_MESSAGE = "用户名或密码错误";

    private final UserMapper userMapper;
    private final TokenBlacklistMapper tokenBlacklistMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper,
                       TokenBlacklistMapper tokenBlacklistMapper,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.tokenBlacklistMapper = tokenBlacklistMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        if (userMapper.selectByUsername(username) != null) {
            throw new BizException(ErrorCode.CONFLICT, "用户名已存在");
        }

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(DEFAULT_STATUS);
        user.setRole(DEFAULT_ROLE);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        try {
            userMapper.insert(user);
        } catch (DuplicateKeyException e) {
            throw new BizException(ErrorCode.CONFLICT, "用户名已存在", e);
        }

        return toRegisterResponse(user);
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername().trim();
        User user = userMapper.selectByUsername(username);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BizException(ErrorCode.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
        }
        if (BANNED_STATUS.equals(user.getStatus())) {
            throw new BizException(ErrorCode.PERMISSION_DENIED, "账号已被封禁");
        }
        if (!DEFAULT_STATUS.equals(user.getStatus())) {
            throw new BizException(ErrorCode.PERMISSION_DENIED, "账号状态异常，无法登录");
        }
        return toLoginResponse(user);
    }

    public LogoutResponse logout(String authorizationHeader) {
        String token = jwtUtil.extractBearerToken(authorizationHeader);
        if (tokenBlacklistMapper.existsByToken(token) == 0) {
            TokenBlacklist tokenBlacklist = new TokenBlacklist();
            tokenBlacklist.setToken(token);
            tokenBlacklist.setUserId(UserContext.getCurrentUserId());
            tokenBlacklist.setExpireAt(jwtUtil.getExpireAt(token));
            tokenBlacklist.setCreatedAt(LocalDateTime.now());
            tokenBlacklistMapper.insert(tokenBlacklist);
        }
        LogoutResponse response = new LogoutResponse();
        response.setSuccess(true);
        response.setMessage("退出登录成功");
        return response;
    }

    private RegisterResponse toRegisterResponse(User user) {
        RegisterResponse response = new RegisterResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setStatus(user.getStatus());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    private LoginResponse toLoginResponse(User user) {
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setStatus(user.getStatus());
        response.setRole(user.getRole());
        response.setToken(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole()));
        return response;
    }
}
