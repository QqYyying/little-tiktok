package com.tiktok.video.service;

import com.tiktok.common.auth.JwtUserInfo;
import com.tiktok.common.auth.UserContext;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.infrastructure.storage.FileService;
import com.tiktok.video.dto.DeleteVideoResponse;
import com.tiktok.video.dto.MyVideoPageResponse;
import com.tiktok.video.dto.VideoResponse;
import com.tiktok.video.entity.Video;
import com.tiktok.video.mapper.VideoMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoMapper videoMapper;

    @Mock
    private FileService fileService;

    @InjectMocks
    private VideoService videoService;

    @BeforeEach
    void setUp() {
        JwtUserInfo userInfo = new JwtUserInfo();
        userInfo.setUserId("usr_self");
        userInfo.setUsername("alice");
        userInfo.setRole("USER");
        userInfo.setExpireAt(LocalDateTime.now().plusHours(1));
        UserContext.set(userInfo);
    }

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void getVideoDetailShouldRejectNonOwner() {
        Video video = buildVideo("vid_1", "usr_other", "http://127.0.0.1:9005/ltt/videos/demo.mp4", "http://127.0.0.1:9005/ltt/covers/demo.jpg");
        when(videoMapper.selectById("vid_1")).thenReturn(video);

        BizException exception = assertThrows(BizException.class, () -> videoService.getVideoDetail("vid_1"));

        assertEquals(ErrorCode.PERMISSION_DENIED, exception.getErrorCode());
    }

    @Test
    void getVideoDetailShouldAllowOwner() {
        Video video = buildVideo("vid_1", "usr_self", "http://127.0.0.1:9005/ltt/videos/demo.mp4", "http://127.0.0.1:9005/ltt/covers/demo.jpg");
        when(videoMapper.selectById("vid_1")).thenReturn(video);

        VideoResponse response = videoService.getVideoDetail("vid_1");

        assertEquals("vid_1", response.getVideoId());
        assertEquals("usr_self", response.getAuthorId());
    }

    @Test
    void pageMyVideosShouldReturnOnlyCurrentUserPage() {
        Video video = buildVideo("vid_2", "usr_self", "http://127.0.0.1:9005/ltt/videos/demo2.mp4", "http://127.0.0.1:9005/ltt/covers/demo2.jpg");
        when(videoMapper.countByAuthorId("usr_self", null)).thenReturn(1L);
        when(videoMapper.selectPageByAuthorId("usr_self", null, 10, 0)).thenReturn(List.of(video));

        MyVideoPageResponse response = videoService.pageMyVideos(null, null, null);

        assertEquals(1L, response.getTotal());
        assertEquals(1, response.getPage());
        assertEquals(10, response.getPageSize());
        assertEquals(1, response.getRecords().size());
        assertEquals("vid_2", response.getRecords().get(0).getVideoId());
    }

    @Test
    void deleteVideoShouldLogicalDeleteAndRemoveManagedFiles() {
        Video video = buildVideo("vid_3", "usr_self", "http://127.0.0.1:9005/ltt/videos/demo3.mp4", "http://127.0.0.1:9005/ltt/covers/demo3.jpg");
        when(videoMapper.selectById("vid_3")).thenReturn(video);
        when(videoMapper.logicalDelete(eq("vid_3"), eq("DELETED"), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(1);

        DeleteVideoResponse response = videoService.deleteVideo("vid_3");

        assertTrue(response.isDeleted());
        assertEquals("vid_3", response.getVideoId());
        assertNotNull(response.getDeletedAt());
        verify(fileService).delete("http://127.0.0.1:9005/ltt/videos/demo3.mp4");
        verify(fileService).delete("http://127.0.0.1:9005/ltt/covers/demo3.jpg");
    }

    @Test
    void deleteVideoShouldRejectNonOwner() {
        Video video = buildVideo("vid_4", "usr_other", "http://127.0.0.1:9005/ltt/videos/demo4.mp4", "http://127.0.0.1:9005/ltt/covers/demo4.jpg");
        when(videoMapper.selectById("vid_4")).thenReturn(video);

        BizException exception = assertThrows(BizException.class, () -> videoService.deleteVideo("vid_4"));

        assertEquals(ErrorCode.PERMISSION_DENIED, exception.getErrorCode());
        verify(videoMapper, never()).logicalDelete(eq("vid_4"), eq("DELETED"), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(fileService, never()).delete(any());
    }

    private Video buildVideo(String id, String authorId, String videoUrl, String coverUrl) {
        Video video = new Video();
        video.setId(id);
        video.setAuthorId(authorId);
        video.setAuthorName("alice");
        video.setTitle("demo");
        video.setDescription("demo description");
        video.setVideoUrl(videoUrl);
        video.setCoverUrl(coverUrl);
        video.setLikeCount(0);
        video.setStatus("ACTIVE");
        video.setCreatedAt(LocalDateTime.now());
        video.setUpdatedAt(LocalDateTime.now());
        return video;
    }
}
