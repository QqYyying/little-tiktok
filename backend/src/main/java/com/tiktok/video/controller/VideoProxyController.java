package com.tiktok.video.controller;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/v1")
public class VideoProxyController {

    private final MinioClient minioClient;
    private final String bucket;
    private final String localBaseDir;

    public VideoProxyController(MinioClient minioClient,
                               @Value("${app.storage.s3.bucket}") String bucket,
                               @Value("${app.storage.local.base-dir}") String localBaseDir) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        this.localBaseDir = localBaseDir;
    }

    @GetMapping("/videos/play/{filename:.+}")
    public void streamVideo(@PathVariable String filename, HttpServletResponse response) throws IOException {
        InputStream inputStream = null;
        OutputStream outputStream = null;
        try {
            String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);
            
            inputStream = getInputStream(decodedFilename);

            String contentType = getContentType(decodedFilename);
            response.setContentType(contentType);
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
            response.setHeader("Accept-Ranges", "bytes");
            
            outputStream = response.getOutputStream();
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
            
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to stream video: " + e.getMessage());
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException ignored) {
                }
            }
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException ignored) {
                }
            }
        }
    }

    private InputStream getInputStream(String filename) throws Exception {
        String objectName = "videos/" + filename;
        
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build()
            );
        } catch (MinioException e) {
            Path localPath = Paths.get(localBaseDir, "videos", filename);
            File localFile = localPath.toFile();
            if (localFile.exists()) {
                return new FileInputStream(localFile);
            }
            throw e;
        }
    }

    private String getContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".mov")) {
            return "video/quicktime";
        } else if (lowerFilename.endsWith(".webm")) {
            return "video/webm";
        } else if (lowerFilename.endsWith(".avi")) {
            return "video/x-msvideo";
        } else {
            return "video/mp4";
        }
    }
}