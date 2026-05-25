package com.tiktok.log.dto;

import java.util.List;

public class RequestLogPageResponse {

    private Long total;
    private Integer page;
    private Integer pageSize;
    private List<RequestLogRecordResponse> records;

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

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

    public List<RequestLogRecordResponse> getRecords() {
        return records;
    }

    public void setRecords(List<RequestLogRecordResponse> records) {
        this.records = records;
    }
}
