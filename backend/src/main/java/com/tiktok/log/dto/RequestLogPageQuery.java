package com.tiktok.log.dto;

import java.time.LocalDateTime;

public class RequestLogPageQuery {

    private Integer page;
    private Integer pageSize;
    private String userId;
    private String requestId;
    private String path;
    private String method;
    private String success;
    private String isSlow;
    private String errorCode;
    private String startTime;
    private String endTime;
    private Boolean successValue;
    private Boolean isSlowValue;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer offset;
    private Integer limit;

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getSuccess() {
        return success;
    }

    public void setSuccess(String success) {
        this.success = success;
    }

    public String getIsSlow() {
        return isSlow;
    }

    public void setIsSlow(String isSlow) {
        this.isSlow = isSlow;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Boolean getSuccessValue() {
        return successValue;
    }

    public void setSuccessValue(Boolean successValue) {
        this.successValue = successValue;
    }

    public Boolean getIsSlowValue() {
        return isSlowValue;
    }

    public void setIsSlowValue(Boolean isSlowValue) {
        this.isSlowValue = isSlowValue;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }
}
