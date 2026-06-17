package com.tiktok.log.dto;

public class ApiMetricsSummaryResponse {

    private Long requestCount;
    private Long successCount;
    private Long failCount;
    private Long slowCount;
    private Double avgCostTime;

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
}
