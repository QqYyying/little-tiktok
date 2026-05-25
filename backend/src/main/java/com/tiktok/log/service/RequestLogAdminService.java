package com.tiktok.log.service;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.log.dto.RequestLogPageQuery;
import com.tiktok.log.dto.RequestLogPageResponse;
import com.tiktok.log.dto.RequestLogRecordResponse;
import com.tiktok.log.entity.RequestLog;
import com.tiktok.log.mapper.RequestLogMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class RequestLogAdminService {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final RequestLogMapper requestLogMapper;

    public RequestLogAdminService(RequestLogMapper requestLogMapper) {
        this.requestLogMapper = requestLogMapper;
    }

    public RequestLogPageResponse pageRequestLogs(RequestLogPageQuery query) {
        PermissionUtils.requireAdmin();
        RequestLogPageQuery normalizedQuery = normalize(query == null ? new RequestLogPageQuery() : query);
        long total = requestLogMapper.countByQuery(normalizedQuery);
        List<RequestLogRecordResponse> records = requestLogMapper.selectPageByQuery(normalizedQuery)
                .stream()
                .map(this::toRecordResponse)
                .toList();

        RequestLogPageResponse response = new RequestLogPageResponse();
        response.setTotal(total);
        response.setPage(normalizedQuery.getPage());
        response.setPageSize(normalizedQuery.getPageSize());
        response.setRecords(records);
        return response;
    }

    private RequestLogPageQuery normalize(RequestLogPageQuery query) {
        int page = query.getPage() == null || query.getPage() < 1 ? DEFAULT_PAGE : query.getPage();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1 ? DEFAULT_PAGE_SIZE : query.getPageSize();
        pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

        query.setPage(page);
        query.setPageSize(pageSize);
        query.setOffset((page - 1) * pageSize);
        query.setLimit(pageSize);
        query.setMethod(normalizeUpper(query.getMethod()));
        query.setErrorCode(normalizeUpper(query.getErrorCode()));
        query.setSuccessValue(parseBoolean(query.getSuccess(), "success"));
        query.setIsSlowValue(parseBoolean(query.getIsSlow(), "isSlow"));
        query.setStartDateTime(parseDateTime(query.getStartTime(), "startTime"));
        query.setEndDateTime(parseDateTime(query.getEndTime(), "endTime"));
        return query;
    }

    private Boolean parseBoolean(String value, String fieldName) {
        if (!hasText(value)) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        return switch (normalized) {
            case "true", "1" -> true;
            case "false", "0" -> false;
            default -> throw new BizException(ErrorCode.INVALID_ARGUMENT, fieldName + " 参数错误");
        };
    }

    private LocalDateTime parseDateTime(String value, String fieldName) {
        if (!hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, fieldName + " 时间格式错误，请使用 yyyy-MM-dd HH:mm:ss", e);
        }
    }

    private RequestLogRecordResponse toRecordResponse(RequestLog requestLog) {
        RequestLogRecordResponse response = new RequestLogRecordResponse();
        response.setId(requestLog.getId());
        response.setRequestId(requestLog.getRequestId());
        response.setUserId(requestLog.getUserId());
        response.setInterfaceName(requestLog.getInterfaceName());
        response.setMethod(requestLog.getMethod());
        response.setPath(requestLog.getPath());
        response.setCostTime(requestLog.getCostTime());
        response.setIsSlow(requestLog.getIsSlow());
        response.setHttpStatus(requestLog.getHttpStatus());
        response.setSuccess(requestLog.getSuccess());
        response.setErrorCode(requestLog.getErrorCode());
        response.setClientIp(requestLog.getClientIp());
        response.setCreatedAt(requestLog.getCreatedAt());
        return response;
    }

    private String normalizeUpper(String value) {
        return hasText(value) ? value.trim().toUpperCase() : value;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
