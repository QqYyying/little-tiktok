package com.tiktok.recommend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendFeedResponse {

    private List<RecommendVideoItemResponse> items;
    private Boolean hasMore;
}
