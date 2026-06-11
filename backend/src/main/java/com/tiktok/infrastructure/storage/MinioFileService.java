package com.tiktok.infrastructure.storage;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InvalidResponseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class MinioFileService implements FileService {

    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "mov", "avi", "webm");
    private static final Set<String> COVER_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> VIDEO_CONTENT_TYPES = Set.of("video/mp4", "video/quicktime", "video/x-msvideo", "video/webm");
    private static final Set<String> COVER_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final MinioClient minioClient;
    private final String endpoint;
    private final String bucket;
    private final String publicBaseUrl;
    private volatile boolean bucketInitialized;

    public MinioFileService(@Value("${app.storage.s3.endpoint}") String endpoint,
                            @Value("${app.storage.s3.access-key}") String accessKey,
                            @Value("${app.storage.s3.secret-key}") String secretKey,
                            @Value("${app.storage.s3.bucket}") String bucket,
                            @Value("${app.storage.s3.public-base-url}") String publicBaseUrl) {
        this.endpoint = normalizeEndpoint(endpoint);
        this.minioClient = MinioClient.builder()
                .endpoint(this.endpoint)
                .credentials(accessKey, secretKey)
                .build();
        this.bucket = bucket;
        this.publicBaseUrl = normalizePublicBaseUrl(publicBaseUrl);
    }

    @Override
    public StoredFile storeVideo(MultipartFile file) {
        return store(file, "videos", VIDEO_EXTENSIONS, VIDEO_CONTENT_TYPES);
    }

    @Override
    public StoredFile storeCover(MultipartFile file) {
        return store(file, "covers", COVER_EXTENSIONS, COVER_CONTENT_TYPES);
    }

    @Override
    public void delete(String fileUrl) {
        String objectName = extractManagedObjectName(fileUrl);
        if (objectName == null) {
            return;
        }

        initializeBucketIfNeeded();

        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw storageException("failed to delete file from MinIO", e);
        }
    }

    private StoredFile store(MultipartFile file,
                             String folder,
                             Set<String> allowedExtensions,
                             Set<String> allowedContentTypes) {
        if (file == null || file.isEmpty()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "uploaded file must not be empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        if (!allowedExtensions.contains(extension)) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "unsupported file type");
        }

        String contentType = file.getContentType();
        if (contentType != null
                && !contentType.isBlank()
                && !allowedContentTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "unsupported file type");
        }

        initializeBucketIfNeeded();

        String objectName = folder + "/" + UUID.randomUUID().toString().replace("-", "") + "." + extension;
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw storageException("failed to upload file to MinIO", e);
        }

        return new StoredFile(publicBaseUrl + "/" + objectName, objectName);
    }

    private void initializeBucketIfNeeded() {
        if (bucketInitialized) {
            return;
        }
        synchronized (this) {
            if (bucketInitialized) {
                return;
            }
            ensureBucketExists();
            ensureBucketPublicRead();
            bucketInitialized = true;
        }
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw storageException("failed to initialize MinIO bucket", e);
        }
    }

    private void ensureBucketPublicRead() {
        String policy = """
                {
                  "Version":"2012-10-17",
                  "Statement":[
                    {
                      "Effect":"Allow",
                      "Principal":{"AWS":["*"]},
                      "Action":["s3:GetBucketLocation","s3:ListBucket"],
                      "Resource":["arn:aws:s3:::%s"]
                    },
                    {
                      "Effect":"Allow",
                      "Principal":{"AWS":["*"]},
                      "Action":["s3:GetObject"],
                      "Resource":["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket, bucket);
        try {
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                    .bucket(bucket)
                    .config(policy)
                    .build());
        } catch (Exception e) {
            throw storageException("failed to enable public read for MinIO bucket", e);
        }
    }

    private BizException storageException(String action, Exception exception) {
        String message = action;
        if (isWrongApiPort(exception)) {
            message = action + ": MinIO endpoint " + endpoint + " is not the S3 API port. Please use the API port instead of the console port.";
        } else if (exception instanceof ErrorResponseException errorResponseException
                && errorResponseException.errorResponse() != null) {
            message = action + ": " + errorResponseException.errorResponse().code()
                    + " - " + errorResponseException.errorResponse().message();
        } else if (exception.getMessage() != null && !exception.getMessage().isBlank()) {
            message = action + ": " + exception.getMessage();
        }
        return new BizException(ErrorCode.INTERNAL_ERROR, message, exception);
    }

    private boolean isWrongApiPort(Exception exception) {
        if (exception instanceof InvalidResponseException invalidResponseException) {
            return invalidResponseException.getMessage() != null
                    && invalidResponseException.getMessage().contains("S3 API Requests must be made to API port");
        }
        if (exception instanceof ErrorResponseException errorResponseException) {
            return errorResponseException.errorResponse() != null
                    && "InvalidArgument".equals(errorResponseException.errorResponse().code())
                    && errorResponseException.getMessage() != null
                    && errorResponseException.getMessage().contains("API port");
        }
        return exception.getMessage() != null && exception.getMessage().contains("API port");
    }

    private String extractManagedObjectName(String fileUrl) {
        String normalizedUrl = trimToNull(fileUrl);
        if (normalizedUrl == null || !normalizedUrl.startsWith(publicBaseUrl + "/")) {
            return null;
        }
        return normalizedUrl.substring((publicBaseUrl + "/").length());
    }

    private String extractExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "filename must not be empty");
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "file extension must not be empty");
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeEndpoint(String value) {
        if (value == null || value.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "app.storage.s3.endpoint must not be empty");
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String normalizePublicBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "app.storage.s3.public-base-url must not be empty");
        }
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
