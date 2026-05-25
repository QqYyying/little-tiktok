package com.tiktok.common.log;

import com.tiktok.common.auth.UserContext;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.common.utils.RequestIdUtil;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.log.entity.RequestLog;
import com.tiktok.log.service.RequestLogService;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.ConstraintViolationException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Errors;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Aspect
@Component
public class RequestLogAspect {

    private static final Logger log = LoggerFactory.getLogger(RequestLogAspect.class);

    private static final int DEFAULT_SUCCESS_STATUS = 200;
    private static final String UNKNOWN_INTERFACE = "unknown";
    private static final String REQUEST_LOGGED_ATTRIBUTE = "REQUEST_LOGGED";
    private static final String REQUEST_START_TIME_ATTRIBUTE = "REQUEST_START_TIME";

    private final RequestLogService requestLogService;
    private final SensitiveDataMasker sensitiveDataMasker;

    public RequestLogAspect(RequestLogService requestLogService, SensitiveDataMasker sensitiveDataMasker) {
        this.requestLogService = requestLogService;
        this.sensitiveDataMasker = sensitiveDataMasker;
    }

    @Around("execution(public * com.tiktok..controller..*.*(..))")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Throwable error = null;
        try {
            setRequestStartTime(startTime);
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {
            error = e;
            throw e;
        } finally {
            saveControllerLog(joinPoint, startTime, result, error);
        }
    }

    @Around("execution(public boolean com.tiktok.common.auth.AuthInterceptor.preHandle(..))")
    public Object logAuthInterceptorFailure(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        setRequestStartTime(startTime);
        try {
            return joinPoint.proceed();
        } catch (Throwable e) {
            savePreHandleFailureLog(joinPoint, startTime, e);
            throw e;
        }
    }

    @Around("execution(public * com.tiktok.common.exception.GlobalExceptionHandler.*(..))")
    public Object logHandledException(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        saveHandledExceptionLog(joinPoint, result);
        return result;
    }

    private void saveControllerLog(ProceedingJoinPoint joinPoint, long startTime, Object result, Throwable error) {
        try {
            HttpServletRequest request = getRequest();
            HttpServletResponse response = getResponse();
            if (shouldSkip(request) || isLogged(request)) {
                return;
            }
            RequestLog requestLog = buildBaseLog(startTime, request, response);
            requestLog.setInterfaceName(getInterfaceName(joinPoint));
            requestLog.setInputData(sensitiveDataMasker.toMaskedJson(getInputData(joinPoint)));
            fillResult(requestLog, response, result, error);
            requestLogService.save(requestLog);
            markLogged(request);
        } catch (Exception e) {
            log.warn("Build request log failed", e);
        }
    }

    private void savePreHandleFailureLog(ProceedingJoinPoint joinPoint, long startTime, Throwable error) {
        try {
            Object[] args = joinPoint.getArgs();
            HttpServletRequest request = args.length > 0 && args[0] instanceof HttpServletRequest value ? value : getRequest();
            HttpServletResponse response = args.length > 1 && args[1] instanceof HttpServletResponse value ? value : getResponse();
            if (shouldSkip(request) || isLogged(request)) {
                return;
            }
            RequestLog requestLog = buildBaseLog(startTime, request, response);
            requestLog.setInterfaceName(getHandlerInterfaceName(args.length > 2 ? args[2] : null));
            requestLog.setInputData(sensitiveDataMasker.toMaskedJson(getRequestParameters(request)));
            fillResult(requestLog, response, null, error);
            requestLogService.save(requestLog);
            markLogged(request);
        } catch (Exception e) {
            log.warn("Build request log failed", e);
        }
    }

    private void saveHandledExceptionLog(ProceedingJoinPoint joinPoint, Object result) {
        try {
            HttpServletRequest request = getRequest();
            HttpServletResponse response = getResponse();
            if (shouldSkip(request) || isLogged(request)) {
                return;
            }
            Throwable error = getThrowable(joinPoint.getArgs());
            if (error == null) {
                return;
            }
            RequestLog requestLog = buildBaseLog(getRequestStartTime(request), request, response);
            requestLog.setInterfaceName(getHandlerInterfaceName(request == null ? null : request.getAttribute(HandlerMapping.BEST_MATCHING_HANDLER_ATTRIBUTE)));
            requestLog.setInputData(sensitiveDataMasker.toMaskedJson(getRequestParameters(request)));
            fillResult(requestLog, response, result, error);
            requestLogService.save(requestLog);
            markLogged(request);
        } catch (Exception e) {
            log.warn("Build request log failed", e);
        }
    }

    private RequestLog buildBaseLog(long startTime, HttpServletRequest request, HttpServletResponse response) {
        RequestLog requestLog = new RequestLog();
        requestLog.setId(ResourceIdUtil.nextLogId());
        requestLog.setRequestId(getRequestId());
        requestLog.setUserId(getCurrentUserId());
        requestLog.setMethod(request == null ? null : request.getMethod());
        requestLog.setPath(request == null ? null : request.getRequestURI());
        requestLog.setClientIp(getClientIp(request));
        requestLog.setHttpStatus(response == null ? DEFAULT_SUCCESS_STATUS : response.getStatus());
        requestLog.setCostTime(System.currentTimeMillis() - startTime);
        requestLog.setCreatedAt(LocalDateTime.now());
        return requestLog;
    }

    private void fillResult(RequestLog requestLog, HttpServletResponse response, Object result, Throwable error) {
        if (error == null) {
            int status = getSuccessStatus(response, result);
            requestLog.setHttpStatus(status);
            requestLog.setSuccess(status < 400);
            requestLog.setErrorCode(status < 400 ? null : ErrorCode.INTERNAL_ERROR.name());
            requestLog.setOutputData(sensitiveDataMasker.toMaskedJson(result));
            return;
        }

        ErrorCode errorCode = resolveErrorCode(error);
        requestLog.setSuccess(false);
        requestLog.setErrorCode(errorCode.name());
        requestLog.setHttpStatus(errorCode.getHttpStatus());
        requestLog.setOutputData(sensitiveDataMasker.toMaskedJson(getErrorOutput(errorCode, error)));
    }

    private String getRequestId() {
        String requestId = RequestIdUtil.getRequestId();
        if (hasText(requestId)) {
            return requestId;
        }
        requestId = ResourceIdUtil.nextRequestId();
        RequestIdUtil.setRequestId(requestId);
        return requestId;
    }

    private String getCurrentUserId() {
        try {
            return UserContext.isLogin() ? UserContext.getCurrentUserId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private int getSuccessStatus(HttpServletResponse response, Object result) {
        if (result instanceof ResponseEntity<?> responseEntity) {
            return responseEntity.getStatusCode().value();
        }
        int status = response == null ? DEFAULT_SUCCESS_STATUS : response.getStatus();
        return status == 0 ? DEFAULT_SUCCESS_STATUS : status;
    }

    private ErrorCode resolveErrorCode(Throwable error) {
        if (error instanceof BizException bizException) {
            return bizException.getErrorCode();
        }
        if (error instanceof MethodArgumentNotValidException
                || error instanceof BindException
                || error instanceof ConstraintViolationException
                || error instanceof MissingServletRequestParameterException
                || error instanceof HttpMessageNotReadableException
                || error instanceof IllegalArgumentException) {
            return ErrorCode.INVALID_ARGUMENT;
        }
        if (error instanceof NoHandlerFoundException) {
            return ErrorCode.NOT_FOUND;
        }
        return ErrorCode.INTERNAL_ERROR;
    }

    private Map<String, Object> getErrorOutput(ErrorCode errorCode, Throwable error) {
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("errorCode", errorCode.name());
        output.put("message", hasText(error.getMessage()) ? error.getMessage() : errorCode.getMessage());
        return output;
    }

    private Map<String, Object> getInputData(ProceedingJoinPoint joinPoint) {
        Map<String, Object> input = new LinkedHashMap<>();
        Object[] args = joinPoint.getArgs();
        String[] parameterNames = joinPoint.getSignature() instanceof CodeSignature codeSignature
                ? codeSignature.getParameterNames()
                : new String[0];
        Annotation[][] parameterAnnotations = getParameterAnnotations(joinPoint);
        for (int i = 0; i < args.length; i++) {
            Object arg = args[i];
            if (shouldSkipArgument(arg)) {
                continue;
            }
            input.put(resolveParameterName(i, parameterNames, parameterAnnotations), arg);
        }
        return input;
    }

    private Annotation[][] getParameterAnnotations(ProceedingJoinPoint joinPoint) {
        if (!(joinPoint.getSignature() instanceof MethodSignature methodSignature)) {
            return new Annotation[0][];
        }
        Method method = methodSignature.getMethod();
        return method.getParameterAnnotations();
    }

    private String resolveParameterName(int index, String[] parameterNames, Annotation[][] parameterAnnotations) {
        String annotationName = getAnnotationName(index, parameterAnnotations);
        if (hasText(annotationName)) {
            return annotationName;
        }
        if (parameterNames != null && index < parameterNames.length && hasText(parameterNames[index])) {
            return parameterNames[index];
        }
        return "arg" + index;
    }

    private String getAnnotationName(int index, Annotation[][] parameterAnnotations) {
        if (parameterAnnotations == null || index >= parameterAnnotations.length) {
            return null;
        }
        for (Annotation annotation : parameterAnnotations[index]) {
            if (annotation instanceof RequestHeader requestHeader) {
                return firstText(requestHeader.value(), requestHeader.name());
            }
            if (annotation instanceof RequestParam requestParam) {
                return firstText(requestParam.value(), requestParam.name());
            }
            if (annotation instanceof PathVariable pathVariable) {
                return firstText(pathVariable.value(), pathVariable.name());
            }
        }
        return null;
    }

    private String firstText(String first, String second) {
        if (hasText(first)) {
            return first;
        }
        if (hasText(second)) {
            return second;
        }
        return null;
    }

    private boolean shouldSkipArgument(Object arg) {
        if (arg == null) {
            return false;
        }
        Class<?> type = arg.getClass();
        if (type.isArray() && MultipartFile.class.isAssignableFrom(type.getComponentType())) {
            return true;
        }
        return arg instanceof ServletRequest
                || arg instanceof ServletResponse
                || arg instanceof HttpSession
                || arg instanceof MultipartFile
                || arg instanceof BindingResult
                || arg instanceof Errors
                || arg instanceof Model
                || arg instanceof ModelMap
                || arg instanceof InputStream
                || arg instanceof OutputStream
                || arg instanceof Reader
                || arg instanceof Writer
                || arg instanceof SseEmitter;
    }

    private Map<String, Object> getRequestParameters(HttpServletRequest request) {
        Map<String, Object> input = new LinkedHashMap<>();
        if (request == null) {
            return input;
        }
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            String[] values = entry.getValue();
            input.put(entry.getKey(), values == null || values.length != 1 ? values : values[0]);
        }
        Object uriVariables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (uriVariables instanceof Map<?, ?> variables && !variables.isEmpty()) {
            input.put("pathVariables", variables);
        }
        return input;
    }

    private Throwable getThrowable(Object[] args) {
        if (args == null) {
            return null;
        }
        for (Object arg : args) {
            if (arg instanceof Throwable throwable) {
                return throwable;
            }
        }
        return null;
    }

    private void setRequestStartTime(long startTime) {
        HttpServletRequest request = getRequest();
        if (request != null && request.getAttribute(REQUEST_START_TIME_ATTRIBUTE) == null) {
            request.setAttribute(REQUEST_START_TIME_ATTRIBUTE, startTime);
        }
    }

    private long getRequestStartTime(HttpServletRequest request) {
        Object startTime = request == null ? null : request.getAttribute(REQUEST_START_TIME_ATTRIBUTE);
        if (startTime instanceof Long value) {
            return value;
        }
        return System.currentTimeMillis();
    }

    private boolean isLogged(HttpServletRequest request) {
        return request != null && Boolean.TRUE.equals(request.getAttribute(REQUEST_LOGGED_ATTRIBUTE));
    }

    private void markLogged(HttpServletRequest request) {
        if (request != null) {
            request.setAttribute(REQUEST_LOGGED_ATTRIBUTE, true);
        }
    }

    private String getInterfaceName(ProceedingJoinPoint joinPoint) {
        return joinPoint.getSignature().getDeclaringType().getSimpleName() + "." + joinPoint.getSignature().getName();
    }

    private String getHandlerInterfaceName(Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            return handlerMethod.getBeanType().getSimpleName() + "." + handlerMethod.getMethod().getName();
        }
        return UNKNOWN_INTERFACE;
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = getRequestAttributes();
        return attributes == null ? null : attributes.getRequest();
    }

    private HttpServletResponse getResponse() {
        ServletRequestAttributes attributes = getRequestAttributes();
        return attributes == null ? null : attributes.getResponse();
    }

    private ServletRequestAttributes getRequestAttributes() {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes ? attributes : null;
    }

    private boolean shouldSkip(HttpServletRequest request) {
        if (request == null) {
            return true;
        }
        String path = request.getRequestURI();
        return path == null || "/error".equals(path) || path.startsWith("/actuator/");
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (hasText(forwardedFor)) {
            int commaIndex = forwardedFor.indexOf(',');
            return commaIndex >= 0 ? forwardedFor.substring(0, commaIndex).trim() : forwardedFor.trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (hasText(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
