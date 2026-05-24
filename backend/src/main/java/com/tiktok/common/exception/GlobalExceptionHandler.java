package com.tiktok.common.exception;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.result.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BizException.class)
    public ResponseEntity<ApiResponse<Void>> handleBizException(BizException e) {
        return build(e.getErrorCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        return build(ErrorCode.INVALID_ARGUMENT, getFieldErrorMessage(e.getBindingResult().getFieldError()));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Void>> handleBindException(BindException e) {
        return build(ErrorCode.INVALID_ARGUMENT, getFieldErrorMessage(e.getBindingResult().getFieldError()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(violation -> violation.getPropertyPath() + " " + violation.getMessage())
                .orElse(ErrorCode.INVALID_ARGUMENT.getMessage());
        return build(ErrorCode.INVALID_ARGUMENT, message);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingServletRequestParameterException(MissingServletRequestParameterException e) {
        return build(ErrorCode.INVALID_ARGUMENT, e.getParameterName() + " 不能为空");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        return build(ErrorCode.INVALID_ARGUMENT, "请求体格式错误");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return build(ErrorCode.INVALID_ARGUMENT, hasText(e.getMessage()) ? e.getMessage() : ErrorCode.INVALID_ARGUMENT.getMessage());
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandlerFoundException(NoHandlerFoundException e) {
        return build(ErrorCode.NOT_FOUND, ErrorCode.NOT_FOUND.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled exception", e);
        return build(ErrorCode.INTERNAL_ERROR, ErrorCode.INTERNAL_ERROR.getMessage());
    }

    private String getFieldErrorMessage(FieldError fieldError) {
        if (fieldError == null) {
            return ErrorCode.INVALID_ARGUMENT.getMessage();
        }
        String defaultMessage = fieldError.getDefaultMessage();
        if (!hasText(defaultMessage)) {
            return fieldError.getField() + " 参数错误";
        }
        return fieldError.getField() + " " + defaultMessage;
    }

    private ResponseEntity<ApiResponse<Void>> build(ErrorCode errorCode, String message) {
        String responseMessage = hasText(message) ? message : errorCode.getMessage();
        return ResponseEntity
                .status(HttpStatus.valueOf(errorCode.getHttpStatus()))
                .body(ApiResponse.fail(errorCode, responseMessage));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
