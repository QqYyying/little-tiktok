package com.tiktok.log.dto;

import java.util.List;

public class ApiMetricsResponse {

    private String startTime;
    private String endTime;
    private Integer totalApis;
    private List<ApiMetricsRecordResponse> records;

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

    public Integer getTotalApis() {
        return totalApis;
    }

    public void setTotalApis(Integer totalApis) {
        this.totalApis = totalApis;
    }

    public List<ApiMetricsRecordResponse> getRecords() {
        return records;
    }

    public void setRecords(List<ApiMetricsRecordResponse> records) {
        this.records = records;
    }
}
