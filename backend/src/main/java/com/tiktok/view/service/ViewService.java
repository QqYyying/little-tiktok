package com.tiktok.view.service;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.view.dto.ViewHistoryResponse;
import com.tiktok.view.dto.VideoViewResponse;
import com.tiktok.view.mapper.ViewMapper;
import com.tiktok.video.mapper.VideoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ViewService {

    private final ViewMapper viewMapper;
    private final VideoMapper videoMapper;

    public ViewService(ViewMapper viewMapper, VideoMapper videoMapper) {
        this.viewMapper = viewMapper;
        this.videoMapper = videoMapper;
    }

    @Transactional
    public VideoViewResponse reportView(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        viewMapper.insertView(ResourceIdUtil.nextViewId(), userId, videoId);
        return new VideoViewResponse(videoId, true);
    }

    public boolean hasViewed(String userId, String videoId) {
        return viewMapper.existsView(userId, videoId) > 0;
    }

    public ViewHistoryResponse getViewHistory(String userId) {
        validateUserId(userId);
        return new ViewHistoryResponse(viewMapper.findViewHistory(userId));
    }

    private void ensureVisibleVideo(String videoId) {
        if (!videoMapper.existsVisibleVideo(videoId)) {
            throw new BizException(ErrorCode.NOT_FOUND, "Video not found or not visible");
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "userId cannot be blank");
        }
    }

    private void validateVideoId(String videoId) {
        if (videoId == null || videoId.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "videoId cannot be blank");
        }
    }
}
