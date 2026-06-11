package com.tiktok.recommend.controller;

import com.tiktok.common.auth.UserContext;
import com.tiktok.like.dto.LikeStatusResponse;
import com.tiktok.like.service.LikeService;
import com.tiktok.recommend.dto.RecommendRpcRequest;
import com.tiktok.recommend.dto.RecommendRpcResponse;
import com.tiktok.recommend.rpc.RecommendationRpcClient;
import com.tiktok.view.dto.ViewHistoryResponse;
import com.tiktok.view.dto.VideoViewResponse;
import com.tiktok.view.service.ViewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Recommendation", description = "\u63a8\u8350\u4e0e\u4e92\u52a8\u63a5\u53e3")
@Validated
@RestController
@RequestMapping("/api/v1")
public class RecommendationController {

    private final RecommendationRpcClient recommendationRpcClient;
    private final ViewService viewService;
    private final LikeService likeService;

    public RecommendationController(RecommendationRpcClient recommendationRpcClient,
                                    ViewService viewService,
                                    LikeService likeService) {
        this.recommendationRpcClient = recommendationRpcClient;
        this.viewService = viewService;
        this.likeService = likeService;
    }

    @Operation(summary = "\u83b7\u53d6\u63a8\u8350\u6d41")
    @GetMapping("/recommend/feed")
    public RecommendRpcResponse getRecommendFeed(
            @RequestParam(value = "count", required = false)
            @Min(value = 1, message = "count \u5fc5\u987b\u5927\u4e8e\u7b49\u4e8e 1")
            @Max(value = 20, message = "count \u4e0d\u80fd\u8d85\u8fc7 20") Integer count,
            @RequestParam(value = "offset", required = false)
            @Min(value = 0, message = "offset \u5fc5\u987b\u5927\u4e8e\u7b49\u4e8e 0") Integer offset) {
        String userId = UserContext.getCurrentUserId();
        RecommendRpcRequest request = new RecommendRpcRequest(userId, count, offset);
        return recommendationRpcClient.recommend(request);
    }

    @Operation(summary = "\u4e0a\u62a5\u6d4f\u89c8\u8bb0\u5f55")
    @PostMapping("/videos/{videoId}/view")
    public VideoViewResponse reportView(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return viewService.reportView(userId, videoId);
    }

    @Operation(summary = "\u83b7\u53d6\u6d4f\u89c8\u8bb0\u5f55")
    @GetMapping("/videos/view/history")
    public ViewHistoryResponse getViewHistory() {
        String userId = UserContext.getCurrentUserId();
        return viewService.getViewHistory(userId);
    }

    @Operation(summary = "\u70b9\u8d5e\u89c6\u9891")
    @PostMapping("/videos/{videoId}/like")
    public LikeStatusResponse likeVideo(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.likeVideo(userId, videoId);
    }

    @Operation(summary = "\u53d6\u6d88\u70b9\u8d5e")
    @DeleteMapping("/videos/{videoId}/like")
    public LikeStatusResponse unlikeVideo(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.unlikeVideo(userId, videoId);
    }

    @Operation(summary = "\u67e5\u8be2\u70b9\u8d5e\u72b6\u6001")
    @GetMapping("/videos/{videoId}/like/status")
    public LikeStatusResponse getLikeStatus(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.getLikeStatus(userId, videoId);
    }
}
