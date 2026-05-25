package com.tiktok.log.dto;

import java.time.LocalDateTime;

public class ApiMetricsQueryRequest {

    private String startTime;
    private String endTime;
    private String path;
    private String method;
    private Boolean includeAdmin;
    private Integer minCount;
    private Integer limit;
    private String sortBy;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String orderByColumn;

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

    public Boolean getIncludeAdmin() {
        return includeAdmin;
    }

    public void setIncludeAdmin(Boolean includeAdmin) {
        this.includeAdmin = includeAdmin;
    }

    public Integer getMinCount() {
        return minCount;
    }

    public void setMinCount(Integer minCount) {
        this.minCount = minCount;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
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

    public String getOrderByColumn() {
        return orderByColumn;
    }

    public void setOrderByColumn(String orderByColumn) {
        this.orderByColumn = orderByColumn;
    }
}
