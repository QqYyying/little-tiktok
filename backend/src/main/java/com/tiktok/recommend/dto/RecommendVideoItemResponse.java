package com.tiktok.recommend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendVideoItemResponse {

    private String videoId;
    private String authorId;
    private String authorName;
    private String title;
    private String description;
    private String videoUrl;
    private String coverUrl;
    private Integer likeCount;
    private Integer favoriteCount;
    private Integer commentCount;
    private Boolean liked;
    private Boolean favorited;
    private LocalDateTime createdAt;
}
