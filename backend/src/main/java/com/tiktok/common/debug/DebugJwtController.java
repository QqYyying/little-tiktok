package com.tiktok.common.debug;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tiktok.common.auth.JwtUserInfo;
import com.tiktok.common.auth.JwtUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/debug/jwt")
public class DebugJwtController {

    private final JwtUtil jwtUtil;

    public DebugJwtController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/parse")
    public DebugJwtParseResponse parse(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        String token = jwtUtil.extractBearerToken(authorizationHeader);
        JwtUserInfo userInfo = jwtUtil.parseToken(token);
        DebugJwtParseResponse response = new DebugJwtParseResponse();
        response.setUserId(userInfo.getUserId());
        response.setUsername(userInfo.getUsername());
        response.setRole(userInfo.getRole());
        response.setExpireAt(userInfo.getExpireAt());
        return response;
    }

    public static class DebugJwtParseResponse {

        private String userId;
        private String username;
        private String role;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime expireAt;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public LocalDateTime getExpireAt() {
            return expireAt;
        }

        public void setExpireAt(LocalDateTime expireAt) {
            this.expireAt = expireAt;
        }
    }
}
