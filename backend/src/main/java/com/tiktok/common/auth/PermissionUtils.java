package com.tiktok.common.auth;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;

public final class PermissionUtils {

    private static final String ADMIN_ROLE = "ADMIN";

    private PermissionUtils() {
    }

    public static void requireLogin() {
        UserContext.getCurrentUser();
    }

    public static boolean isAdmin() {
        requireLogin();
        return ADMIN_ROLE.equals(UserContext.getCurrentRole());
    }

    public static void requireAdmin() {
        if (!isAdmin()) {
            throw new BizException(ErrorCode.PERMISSION_DENIED, "权限不足");
        }
    }

    public static boolean isOwner(String ownerId) {
        requireLogin();
        if (ownerId == null) {
            return false;
        }
        return ownerId.equals(UserContext.getCurrentUserId());
    }

    public static boolean isOwnerOrAdmin(String ownerId) {
        requireLogin();
        if (ownerId == null) {
            return false;
        }
        return ownerId.equals(UserContext.getCurrentUserId()) || ADMIN_ROLE.equals(UserContext.getCurrentRole());
    }

    public static void requireOwnerOrAdmin(String ownerId) {
        if (!isOwnerOrAdmin(ownerId)) {
            throw new BizException(ErrorCode.PERMISSION_DENIED, "无权限操作该资源");
        }
    }
}
