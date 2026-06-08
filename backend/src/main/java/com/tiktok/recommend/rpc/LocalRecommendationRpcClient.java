package com.tiktok.recommend.rpc;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.recommend.dto.RecommendFeedResponse;
import com.tiktok.recommend.dto.RecommendRpcRequest;
import com.tiktok.recommend.dto.RecommendRpcResponse;
import com.tiktok.recommend.service.RecommendationService;
import org.springframework.stereotype.Component;

/**
 * 本地 RPC 边界模拟实现。
 * 当前通过本地 Bean 调用 RecommendationService，后续可替换为 gRPC / Dubbo Client。
 */
@Component
public class LocalRecommendationRpcClient implements RecommendationRpcClient {

    private final RecommendationService recommendationService;

    public LocalRecommendationRpcClient(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @Override
    public RecommendRpcResponse recommend(RecommendRpcRequest request) {
        if (request == null) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "request 不能为空");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "userId 不能为空");
        }

        RecommendFeedResponse feedResponse = recommendationService.getRecommendFeed(
                request.getUserId(),
                request.getCount() == null ? 0 : request.getCount()
        );

        return new RecommendRpcResponse(feedResponse.getItems(), feedResponse.getHasMore());
    }
}
