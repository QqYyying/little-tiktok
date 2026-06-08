package com.tiktok.view.mapper;

import com.tiktok.view.dto.ViewHistoryItemResponse;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ViewMapper {

    int insertView(@Param("id") String id, @Param("userId") String userId, @Param("videoId") String videoId);

    int existsView(@Param("userId") String userId, @Param("videoId") String videoId);

    List<String> findViewedVideoIds(@Param("userId") String userId);

    List<ViewHistoryItemResponse> findViewHistory(@Param("userId") String userId);
}
