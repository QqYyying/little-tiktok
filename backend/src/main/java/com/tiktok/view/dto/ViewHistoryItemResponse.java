package com.tiktok.view.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViewHistoryItemResponse {

    private String videoId;
    private String authorId;
    private String authorName;
    private String title;
    private String description;
    private String videoUrl;
    private String coverUrl;
    private Integer likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime viewedAt;
}
