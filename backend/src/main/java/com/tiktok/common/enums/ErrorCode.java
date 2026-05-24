package com.tiktok.common.enums;

public enum ErrorCode {

    OK("success", 200),
    INVALID_ARGUMENT("参数错误", 400),
    UNAUTHORIZED("请先登录", 401),
    TOKEN_EXPIRED("登录已过期", 401),
    PERMISSION_DENIED("权限不足", 403),
    NOT_FOUND("资源不存在", 404),
    CONFLICT("资源冲突", 409),
    INTERNAL_ERROR("系统异常", 500);

    private final String message;
    private final int httpStatus;

    ErrorCode(String message, int httpStatus) {
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getMessage() {
        return message;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
