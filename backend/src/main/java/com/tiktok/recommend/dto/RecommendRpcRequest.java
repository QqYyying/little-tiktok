package com.tiktok.recommend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendRpcRequest {

    private String userId;
    private Integer count;
    private Integer offset;
}
