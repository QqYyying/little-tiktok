package com.tiktok.common.auth;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.user.mapper.TokenBlacklistMapper;
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

    public AuthInterceptor(JwtUtil jwtUtil, TokenBlacklistMapper tokenBlacklistMapper) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistMapper = tokenBlacklistMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
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
}
