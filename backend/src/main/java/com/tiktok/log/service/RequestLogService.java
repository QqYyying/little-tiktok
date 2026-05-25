package com.tiktok.log.service;

import com.tiktok.log.entity.RequestLog;
import com.tiktok.log.mapper.RequestLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class RequestLogService {

    private static final Logger log = LoggerFactory.getLogger(RequestLogService.class);

    private final RequestLogMapper requestLogMapper;

    public RequestLogService(RequestLogMapper requestLogMapper) {
        this.requestLogMapper = requestLogMapper;
    }

    public void save(RequestLog requestLog) {
        try {
            requestLogMapper.insert(requestLog);
        } catch (Exception e) {
            log.warn("Save request log failed, requestId={}", requestLog == null ? null : requestLog.getRequestId(), e);
        }
    }
}
