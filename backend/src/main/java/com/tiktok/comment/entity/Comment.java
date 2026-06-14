package com.tiktok.comment.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String id;
    private String videoId;
    private String userId;
    private String content;
    private Integer likeCount;
    private String replyToId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}