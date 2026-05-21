package com.tiktok.common.enums;

public enum ResultCodeEnum {

    SUCCESS(200, "success"),
    FAIL(500, "fail");

    private final int code;
    private final String message;

    ResultCodeEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
