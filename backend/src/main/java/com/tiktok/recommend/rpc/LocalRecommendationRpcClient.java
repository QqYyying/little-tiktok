package com.tiktok.recommend.rpc;

import com.tiktok.recommend.dto.RecommendFeedResponse;
import com.tiktok.recommend.dto.RecommendRpcRequest;
import com.tiktok.recommend.dto.RecommendRpcResponse;
import com.tiktok.recommend.service.RecommendationService;
import org.springframework.stereotype.Component;

/**
 * Local RPC boundary implementation.
 * It currently delegates to RecommendationService and can later be replaced by gRPC / Dubbo.
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
            request = new RecommendRpcRequest();
        }

        RecommendFeedResponse feedResponse = recommendationService.getRecommendFeed(
                request.getUserId(),
                request.getCount() == null ? 0 : request.getCount(),
                request.getOffset() == null ? 0 : request.getOffset()
        );

        return new RecommendRpcResponse(feedResponse.getItems(), feedResponse.getHasMore());
    }
}
