package com.tiktok.common.auth;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;

public final class UserContext {

    private static final ThreadLocal<JwtUserInfo> CURRENT_USER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(JwtUserInfo userInfo) {
        if (userInfo == null) {
            clear();
            return;
        }
        CURRENT_USER.set(userInfo);
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public static String getCurrentUsername() {
        return getCurrentUser().getUsername();
    }

    public static String getCurrentRole() {
        return getCurrentUser().getRole();
    }

    public static JwtUserInfo getCurrentUser() {
        JwtUserInfo userInfo = CURRENT_USER.get();
        if (userInfo == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        return userInfo;
    }

    public static boolean isLogin() {
        return CURRENT_USER.get() != null;
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
