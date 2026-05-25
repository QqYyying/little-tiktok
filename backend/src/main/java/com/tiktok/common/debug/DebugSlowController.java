package com.tiktok.common.debug;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugSlowController {

    @GetMapping("/slow")
    public Map<String, Object> slow(@RequestParam(defaultValue = "600") long ms,
                                    @RequestParam(defaultValue = "false") boolean fail) throws InterruptedException {
        long sleepMs = Math.max(0, ms);
        Thread.sleep(sleepMs);
        if (fail) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "debug slow error");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sleptMs", sleepMs);
        return result;
    }
}
