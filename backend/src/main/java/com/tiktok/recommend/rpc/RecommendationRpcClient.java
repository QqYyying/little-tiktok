package com.tiktok.recommend.rpc;

import com.tiktok.recommend.dto.RecommendRpcRequest;
import com.tiktok.recommend.dto.RecommendRpcResponse;

public interface RecommendationRpcClient {

    RecommendRpcResponse recommend(RecommendRpcRequest request);
}
