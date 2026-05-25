package com.tiktok.log.mapper;

import com.tiktok.log.dto.RequestLogPageQuery;
import com.tiktok.log.entity.RequestLog;

import java.util.List;

public interface RequestLogMapper {

    int insert(RequestLog requestLog);

    long countByQuery(RequestLogPageQuery query);

    List<RequestLog> selectPageByQuery(RequestLogPageQuery query);
}
