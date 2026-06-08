package com.tiktok.video.dto;

import java.util.List;

public class MyVideoPageResponse {

    private Long total;
    private Integer page;
    private Integer pageSize;
    private List<VideoResponse> records;

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

    public List<VideoResponse> getRecords() {
        return records;
    }

    public void setRecords(List<VideoResponse> records) {
        this.records = records;
    }
}
