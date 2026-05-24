package com.tiktok.common.result;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.utils.RequestIdUtil;

public class ApiResponse<T> {

    private String code;
    private String message;
    private T data;
    private String requestId;

    public ApiResponse() {
        this.requestId = RequestIdUtil.getRequestId();
    }

    public ApiResponse(String code, String message, T data, String requestId) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.requestId = requestId;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return of(ErrorCode.OK, ErrorCode.OK.getMessage(), data);
    }

    public static <T> ApiResponse<T> ok() {
        return of(ErrorCode.OK, ErrorCode.OK.getMessage(), null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode) {
        return of(errorCode, errorCode.getMessage(), null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode, String message) {
        return of(errorCode, message, null);
    }

    public static <T> ApiResponse<T> of(ErrorCode errorCode, String message, T data) {
        return new ApiResponse<>(errorCode.name(), message, data, RequestIdUtil.getRequestId());
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}
