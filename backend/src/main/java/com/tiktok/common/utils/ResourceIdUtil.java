package com.tiktok.common.utils;

public final class ResourceIdUtil {

    private static final String USER_PREFIX = "usr_";
    private static final String VIDEO_PREFIX = "vid_";
    private static final String VIEW_PREFIX = "view_";
    private static final String LIKE_PREFIX = "like_";
    private static final String FAVORITE_PREFIX = "fav_";
    private static final String COMMENT_PREFIX = "cmt_";
    private static final String LOG_PREFIX = "log_";
    private static final String TOKEN_BLACKLIST_PREFIX = "tbl_";
    private static final String REQUEST_PREFIX = "req_";

    private ResourceIdUtil() {
    }

    public static String nextUserId() {
        return nextId(USER_PREFIX);
    }

    public static String nextVideoId() {
        return nextId(VIDEO_PREFIX);
    }

    public static String nextViewId() {
        return nextId(VIEW_PREFIX);
    }

    public static String nextLikeId() {
        return nextId(LIKE_PREFIX);
    }

    public static String nextFavoriteId() {
        return nextId(FAVORITE_PREFIX);
    }

    public static String nextCommentId() {
        return nextId(COMMENT_PREFIX);
    }

    public static String nextLogId() {
        return nextId(LOG_PREFIX);
    }

    public static String nextTokenBlacklistId() {
        return nextId(TOKEN_BLACKLIST_PREFIX);
    }

    public static String nextRequestId() {
        return nextId(REQUEST_PREFIX);
    }

    private static String nextId(String prefix) {
        return prefix + SnowflakeIdGenerator.nextId();
    }
}
