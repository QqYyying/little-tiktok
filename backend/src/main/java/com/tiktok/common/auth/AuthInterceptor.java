package com.tiktok.common.auth;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.user.entity.User;
import com.tiktok.user.mapper.TokenBlacklistMapper;
import com.tiktok.user.mapper.UserMapper;
import com.tiktok.user.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String TOKEN_ALREADY_BLACKLISTED_ATTRIBUTE = "TOKEN_ALREADY_BLACKLISTED";

    private static final String LOGOUT_PATH = "/api/v1/auth/logout";

    private final JwtUtil jwtUtil;
    private final TokenBlacklistMapper tokenBlacklistMapper;
    private final UserMapper userMapper;
    private final AuthService authService;

    public AuthInterceptor(JwtUtil jwtUtil,
                           TokenBlacklistMapper tokenBlacklistMapper,
                           UserMapper userMapper,
                           AuthService authService) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistMapper = tokenBlacklistMapper;
        this.userMapper = userMapper;
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        if (isPublicReadRequest(request) && !hasAuthorizationHeader(request)) {
            UserContext.clear();
            return true;
        }

        String token = jwtUtil.extractBearerToken(request.getHeader("Authorization"));
        JwtUserInfo userInfo = jwtUtil.parseToken(token);
        boolean tokenBlacklisted = tokenBlacklistMapper.existsByToken(token) > 0;
        if (tokenBlacklisted && !isLogoutRequest(request)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "登录状态已失效，请重新登录");
        }
        if (tokenBlacklisted) {
            request.setAttribute(TOKEN_ALREADY_BLACKLISTED_ATTRIBUTE, true);
        }
        if (!isLogoutRequest(request)) {
            User user = userMapper.selectById(userInfo.getUserId());
            authService.ensureUserCanAccess(user);
        }
        UserContext.set(userInfo);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }

    private boolean isLogoutRequest(HttpServletRequest request) {
        return HttpMethod.POST.matches(request.getMethod()) && LOGOUT_PATH.equals(request.getRequestURI());
    }

    private boolean isPublicReadRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return HttpMethod.GET.matches(request.getMethod())
                && ("/api/v1/recommend/feed".equals(uri)
                || uri.matches("^/api/v1/comments/[^/]+$"));
    }

    private boolean hasAuthorizationHeader(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        return authorization != null && !authorization.isBlank();
    }
}
