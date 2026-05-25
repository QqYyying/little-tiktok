package com.tiktok.common.utils;

import org.slf4j.MDC;

public final class RequestIdUtil {

    private static final String REQUEST_ID_KEY = "requestId";
    private static final String TRACE_ID_KEY = "traceId";
    private static final ThreadLocal<String> REQUEST_ID_HOLDER = new ThreadLocal<>();

    private RequestIdUtil() {
    }

    public static void setRequestId(String requestId) {
        if (!hasText(requestId)) {
            clear();
            return;
        }
        REQUEST_ID_HOLDER.set(requestId);
        MDC.put(REQUEST_ID_KEY, requestId);
    }

    public static String getRequestId() {
        String requestId = REQUEST_ID_HOLDER.get();
        if (hasText(requestId)) {
            return requestId;
        }

        requestId = MDC.get(REQUEST_ID_KEY);
        if (hasText(requestId)) {
            return requestId;
        }

        requestId = MDC.get(TRACE_ID_KEY);
        if (hasText(requestId)) {
            return requestId;
        }

        requestId = ResourceIdUtil.nextRequestId();
        setRequestId(requestId);
        return requestId;
    }

    public static void clear() {
        REQUEST_ID_HOLDER.remove();
        MDC.remove(REQUEST_ID_KEY);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
