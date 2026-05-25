package com.tiktok.common.auth;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtUtil {

    private static final String USER_ID_CLAIM = "userId";
    private static final String USERNAME_CLAIM = "username";
    private static final String ROLE_CLAIM = "role";
    private static final String BEARER_PREFIX = "Bearer ";

    private String secret;
    private long expireSeconds = 7200;
    private String issuer = "little-tiktok";

    public String generateToken(Long userId, String username, String role) {
        Instant now = Instant.now();
        Instant expireAt = now.plusSeconds(expireSeconds);
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim(USER_ID_CLAIM, userId)
                .claim(USERNAME_CLAIM, username)
                .claim(ROLE_CLAIM, role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expireAt))
                .signWith(getSecretKey(), Jwts.SIG.HS256)
                .compact();
    }

    public JwtUserInfo parseToken(String token) {
        Claims claims = parseClaims(token);
        JwtUserInfo userInfo = new JwtUserInfo();
        userInfo.setUserId(readUserId(claims));
        userInfo.setUsername(claims.get(USERNAME_CLAIM, String.class));
        userInfo.setRole(claims.get(ROLE_CLAIM, String.class));
        userInfo.setExpireAt(toLocalDateTime(claims.getExpiration()));
        return userInfo;
    }

    public boolean validateToken(String token) {
        parseClaims(token);
        return true;
    }

    public LocalDateTime getExpireAt(String token) {
        return toLocalDateTime(parseClaims(token).getExpiration());
    }

    public String extractBearerToken(String authorizationHeader) {
        if (!hasText(authorizationHeader)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "无效的登录凭证");
        }
        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (!hasText(token)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        return token;
    }

    private Claims parseClaims(String token) {
        if (!hasText(token)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        try {
            return Jwts.parser()
                    .verifyWith(getSecretKey())
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new BizException(ErrorCode.TOKEN_EXPIRED, "登录已过期", e);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "无效的登录凭证", e);
        }
    }

    private SecretKey getSecretKey() {
        if (!hasText(secret)) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "JWT 配置缺失");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "JWT secret 长度不能小于 32 字节");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Long readUserId(Claims claims) {
        Object userId = claims.get(USER_ID_CLAIM);
        if (userId instanceof Number number) {
            return number.longValue();
        }
        if (userId instanceof String value && hasText(value)) {
            return Long.parseLong(value);
        }
        return Long.valueOf(claims.getSubject());
    }

    private LocalDateTime toLocalDateTime(Date date) {
        return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpireSeconds() {
        return expireSeconds;
    }

    public void setExpireSeconds(long expireSeconds) {
        this.expireSeconds = expireSeconds;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
}
