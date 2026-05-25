package com.tiktok.log.dto;

public class ApiMetricsRecordResponse {

    private String path;
    private String method;
    private Long requestCount;
    private Long successCount;
    private Long failCount;
    private Long slowCount;
    private Double avgCostTime;
    private Long maxCostTime;
    private Long minCostTime;
    private Double successRate;
    private Double slowRate;

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

    public Long getRequestCount() {
        return requestCount;
    }

    public void setRequestCount(Long requestCount) {
        this.requestCount = requestCount;
    }

    public Long getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(Long successCount) {
        this.successCount = successCount;
    }

    public Long getFailCount() {
        return failCount;
    }

    public void setFailCount(Long failCount) {
        this.failCount = failCount;
    }

    public Long getSlowCount() {
        return slowCount;
    }

    public void setSlowCount(Long slowCount) {
        this.slowCount = slowCount;
    }

    public Double getAvgCostTime() {
        return avgCostTime;
    }

    public void setAvgCostTime(Double avgCostTime) {
        this.avgCostTime = avgCostTime;
    }

    public Long getMaxCostTime() {
        return maxCostTime;
    }

    public void setMaxCostTime(Long maxCostTime) {
        this.maxCostTime = maxCostTime;
    }

    public Long getMinCostTime() {
        return minCostTime;
    }

    public void setMinCostTime(Long minCostTime) {
        this.minCostTime = minCostTime;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Double getSlowRate() {
        return slowRate;
    }

    public void setSlowRate(Double slowRate) {
        this.slowRate = slowRate;
    }
}
