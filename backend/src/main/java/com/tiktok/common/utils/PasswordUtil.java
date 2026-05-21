package com.tiktok.common.utils;

public final class PasswordUtil {

    private PasswordUtil() {
    }

    public static String encode(String rawPassword) {
        return rawPassword;
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        return rawPassword != null && rawPassword.equals(encodedPassword);
    }
}
