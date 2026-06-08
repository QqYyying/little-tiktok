package com.tiktok.like.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeStatusResponse {

    private String videoId;
    private Boolean liked;
    private Integer likeCount;
}
