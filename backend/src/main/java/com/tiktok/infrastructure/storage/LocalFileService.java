package com.tiktok.infrastructure.storage;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Primary
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
@Service
public class LocalFileService implements FileService {

    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "mov", "avi", "webm");
    private static final Set<String> COVER_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "video/webm"
    );
    private static final Set<String> COVER_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path rootDir;
    private final String publicBaseUrl;

    public LocalFileService(@Value("${app.storage.local.base-dir:uploads}") String baseDir,
                            @Value("${app.storage.local.public-base-url:/uploads}") String publicBaseUrl) {
        this.rootDir = resolveRootDir(baseDir);
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
        String normalizedUrl = trimToNull(fileUrl);
        if (normalizedUrl == null || !normalizedUrl.startsWith(publicBaseUrl + "/")) {
            return;
        }

        String relativePath = normalizedUrl.substring((publicBaseUrl + "/").length());
        Path targetFile = rootDir.resolve(relativePath).normalize();
        ensureInsideRoot(targetFile);

        try {
            Files.deleteIfExists(targetFile);
        } catch (IOException e) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "failed to delete local file", e);
        }
    }

    public String getRootDir() {
        return rootDir.toString();
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    private StoredFile store(MultipartFile file,
                             String category,
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
        if (contentType != null && !contentType.isBlank()
                && !allowedContentTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "unsupported file type");
        }

        Path categoryDir = rootDir.resolve(category).normalize();
        ensureInsideRoot(categoryDir);
        createDirectories(categoryDir);

        String storedFilename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path targetFile = categoryDir.resolve(storedFilename).normalize();
        ensureInsideRoot(targetFile);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "failed to store local file", e);
        }

        String relativePath = category + "/" + storedFilename;
        String publicUrl = publicBaseUrl + "/" + relativePath.replace("\\", "/");
        return new StoredFile(publicUrl, relativePath);
    }

    private String extractExtension(String filename) {
        if (filename == null) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "filename must not be empty");
        }
        String normalized = Paths.get(filename).getFileName().toString();
        int dotIndex = normalized.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == normalized.length() - 1) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "file extension must not be empty");
        }
        return normalized.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private void createDirectories(Path directory) {
        try {
            Files.createDirectories(directory);
        } catch (IOException e) {
            throw new BizException(ErrorCode.INTERNAL_ERROR, "failed to initialize local storage directory", e);
        }
    }

    private void ensureInsideRoot(Path path) {
        if (!path.startsWith(rootDir)) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "invalid file path");
        }
    }

    private Path resolveRootDir(String baseDir) {
        Path configuredPath = Paths.get(baseDir);
        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }

        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path cwdPath = cwd.resolve(configuredPath).normalize();
        if (Files.exists(cwdPath) || cwd.endsWith("backend")) {
            return cwdPath;
        }

        Path backendPath = cwd.resolve("backend").resolve(configuredPath).normalize();
        if (Files.exists(backendPath)) {
            return backendPath;
        }

        return cwdPath;
    }

    private String normalizePublicBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "/uploads";
        }
        String normalized = baseUrl.startsWith("/") ? baseUrl : "/" + baseUrl;
        return normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
