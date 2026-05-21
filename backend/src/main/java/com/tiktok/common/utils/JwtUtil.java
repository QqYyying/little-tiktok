package com.tiktok.common.utils;

public final class JwtUtil {

    private JwtUtil() {
    }

    public static String createToken(String subject) {
        return subject;
    }

    public static String parseSubject(String token) {
        return token;
    }
}
