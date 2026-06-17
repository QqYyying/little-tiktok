package com.tiktok.log.service;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.log.dto.ApiMetricsQueryRequest;
import com.tiktok.log.dto.ApiMetricsRecordResponse;
import com.tiktok.log.dto.ApiMetricsResponse;
import com.tiktok.log.dto.ApiMetricsSummaryResponse;
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
    private static final int DEFAULT_METRICS_LIMIT = 20;
    private static final int MAX_METRICS_LIMIT = 100;
    private static final int DEFAULT_MIN_COUNT = 1;
    private static final String SORT_BY_AVG_COST_TIME = "avgCostTime";
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

    public ApiMetricsResponse getApiMetrics(ApiMetricsQueryRequest query) {
        PermissionUtils.requireAdmin();
        ApiMetricsQueryRequest normalizedQuery = normalizeMetricsQuery(query == null ? new ApiMetricsQueryRequest() : query);
        ApiMetricsSummaryResponse summary = requestLogMapper.selectApiMetricsSummary(normalizedQuery);
        List<ApiMetricsRecordResponse> records = requestLogMapper.selectApiMetrics(normalizedQuery);
        records.forEach(record -> record.setPath(toApiPathPattern(record.getPath(), record.getMethod())));
        records.forEach(this::fillRates);

        ApiMetricsResponse response = new ApiMetricsResponse();
        response.setStartTime(formatDateTime(normalizedQuery.getStartDateTime()));
        response.setEndTime(formatDateTime(normalizedQuery.getEndDateTime()));
        response.setTotalApis(records.size());
        response.setSummary(normalizeSummary(summary));
        response.setRecords(records);
        return response;
    }

    private ApiMetricsSummaryResponse normalizeSummary(ApiMetricsSummaryResponse summary) {
        ApiMetricsSummaryResponse normalized = summary == null ? new ApiMetricsSummaryResponse() : summary;
        if (normalized.getRequestCount() == null) {
            normalized.setRequestCount(0L);
        }
        if (normalized.getSuccessCount() == null) {
            normalized.setSuccessCount(0L);
        }
        if (normalized.getFailCount() == null) {
            normalized.setFailCount(0L);
        }
        if (normalized.getSlowCount() == null) {
            normalized.setSlowCount(0L);
        }
        if (normalized.getAvgCostTime() == null) {
            normalized.setAvgCostTime(0.0);
        }
        return normalized;
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

    private ApiMetricsQueryRequest normalizeMetricsQuery(ApiMetricsQueryRequest query) {
        query.setStartDateTime(parseDateTime(query.getStartTime(), "startTime"));
        query.setEndDateTime(parseDateTime(query.getEndTime(), "endTime"));
        query.setMethod(normalizeUpper(query.getMethod()));
        query.setIncludeAdmin(query.getIncludeAdmin() == null || query.getIncludeAdmin());
        query.setMinCount(query.getMinCount() == null || query.getMinCount() < 1 ? DEFAULT_MIN_COUNT : query.getMinCount());

        int limit = query.getLimit() == null || query.getLimit() < 1 ? DEFAULT_METRICS_LIMIT : query.getLimit();
        query.setLimit(Math.min(limit, MAX_METRICS_LIMIT));
        query.setSortBy(normalizeSortBy(query.getSortBy()));
        query.setOrderByColumn(toOrderByColumn(query.getSortBy()));
        return query;
    }

    private String normalizeSortBy(String sortBy) {
        if (!hasText(sortBy)) {
            return SORT_BY_AVG_COST_TIME;
        }
        return switch (sortBy.trim()) {
            case "avgCostTime", "maxCostTime", "requestCount", "slowCount", "failCount" -> sortBy.trim();
            default -> SORT_BY_AVG_COST_TIME;
        };
    }

    private String toOrderByColumn(String sortBy) {
        return switch (sortBy) {
            case "maxCostTime" -> "max_cost_time";
            case "requestCount" -> "request_count";
            case "slowCount" -> "slow_count";
            case "failCount" -> "fail_count";
            default -> "avg_cost_time";
        };
    }

    private void fillRates(ApiMetricsRecordResponse record) {
        long requestCount = record.getRequestCount() == null ? 0 : record.getRequestCount();
        if (requestCount <= 0) {
            record.setSuccessRate(0.0);
            record.setSlowRate(0.0);
            return;
        }
        long successCount = record.getSuccessCount() == null ? 0 : record.getSuccessCount();
        long slowCount = record.getSlowCount() == null ? 0 : record.getSlowCount();
        record.setSuccessRate((double) successCount / requestCount);
        record.setSlowRate((double) slowCount / requestCount);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : DATE_TIME_FORMATTER.format(dateTime);
    }

    private String toApiPathPattern(String path, String method) {
        if (!hasText(path)) {
            return path;
        }
        String normalizedPath = path.trim();
        if (normalizedPath.contains("{")) {
            return normalizedPath;
        }
        String normalizedMethod = method == null ? "" : method.trim().toUpperCase();

        if (normalizedPath.matches("^/api/v1/videos/[^/]+$")) {
            return "/api/v1/videos/{videoId}";
        }
        if (normalizedPath.matches("^/api/v1/videos/[^/]+/(like|favorite|view)$")) {
            String action = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
            return "/api/v1/videos/{videoId}/" + action;
        }
        if (normalizedPath.matches("^/api/v1/comments/[^/]+$")) {
            return "GET".equals(normalizedMethod)
                    ? "/api/v1/comments/{videoId}"
                    : "/api/v1/comments/{commentId}";
        }
        if (normalizedPath.matches("^/api/v1/comments/[^/]+/(like|unlike)$")) {
            String action = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
            return "/api/v1/comments/{commentId}/" + action;
        }

        return normalizedPath;
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
        response.setInputData(requestLog.getInputData());
        response.setOutputData(requestLog.getOutputData());
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
