package com.tiktok.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateVideoJsonRequest {

    @NotBlank(message = "不能为空")
    @Size(max = 128, message = "长度不能超过 128")
    private String title;

    @Size(max = 500, message = "长度不能超过 500")
    private String description;

    @NotBlank(message = "不能为空")
    @Size(max = 512, message = "长度不能超过 512")
    private String videoUrl;

    @Size(max = 512, message = "长度不能超过 512")
    private String coverUrl;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }
}
