package com.tiktok.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String videoId;
    private String userId;
    private String username;
    private String content;
    private Integer likeCount;
    private Boolean liked;
    private String replyToId;
    private String replyToUsername;
    private LocalDateTime createdAt;
}