package com.tiktok.admin.controller;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.auth.UserContext;
import com.tiktok.log.dto.ApiMetricsQueryRequest;
import com.tiktok.log.dto.ApiMetricsResponse;
import com.tiktok.log.dto.RequestLogPageQuery;
import com.tiktok.log.dto.RequestLogPageResponse;
import com.tiktok.log.service.RequestLogAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin", description = "管理员接口")
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final RequestLogAdminService requestLogAdminService;

    public AdminController(RequestLogAdminService requestLogAdminService) {
        this.requestLogAdminService = requestLogAdminService;
    }

    @Operation(summary = "分页查询请求日志")
    @GetMapping("/request-logs")
    public RequestLogPageResponse requestLogs(RequestLogPageQuery query) {
        PermissionUtils.requireAdmin();
        return requestLogAdminService.pageRequestLogs(query);
    }

    @Operation(summary = "接口耗时统计")
    @GetMapping("/api-metrics")
    public ApiMetricsResponse apiMetrics(ApiMetricsQueryRequest query) {
        PermissionUtils.requireAdmin();
        return requestLogAdminService.getApiMetrics(query);
    }

    @Operation(summary = "管理员连通性检查")
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        PermissionUtils.requireAdmin();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "admin ok");
        result.put("userId", UserContext.getCurrentUserId());
        result.put("role", UserContext.getCurrentRole());
        return result;
    }
}
