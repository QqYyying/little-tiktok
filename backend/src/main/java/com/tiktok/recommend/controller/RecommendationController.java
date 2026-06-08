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

@Tag(name = "Recommendation", description = "推荐与互动接口")
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

    @Operation(summary = "获取推荐流")
    @GetMapping("/recommend/feed")
    public RecommendRpcResponse getRecommendFeed(
            @RequestParam(value = "count", required = false)
            @Min(value = 1, message = "count 必须大于等于 1")
            @Max(value = 20, message = "count 不能超过 20") Integer count) {
        String userId = UserContext.getCurrentUserId();
        RecommendRpcRequest request = new RecommendRpcRequest(userId, count);
        return recommendationRpcClient.recommend(request);
    }

    @Operation(summary = "上报浏览记录")
    @PostMapping("/videos/{videoId}/view")
    public VideoViewResponse reportView(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return viewService.reportView(userId, videoId);
    }

    @Operation(summary = "获取浏览记录")
    @GetMapping("/videos/view/history")
    public ViewHistoryResponse getViewHistory() {
        String userId = UserContext.getCurrentUserId();
        return viewService.getViewHistory(userId);
    }

    @Operation(summary = "点赞视频")
    @PostMapping("/videos/{videoId}/like")
    public LikeStatusResponse likeVideo(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.likeVideo(userId, videoId);
    }

    @Operation(summary = "取消点赞")
    @DeleteMapping("/videos/{videoId}/like")
    public LikeStatusResponse unlikeVideo(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.unlikeVideo(userId, videoId);
    }

    @Operation(summary = "查询点赞状态")
    @GetMapping("/videos/{videoId}/like/status")
    public LikeStatusResponse getLikeStatus(@PathVariable("videoId") String videoId) {
        String userId = UserContext.getCurrentUserId();
        return likeService.getLikeStatus(userId, videoId);
    }
}
