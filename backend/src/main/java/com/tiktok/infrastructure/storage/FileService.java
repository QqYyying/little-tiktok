package com.tiktok.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    StoredFile storeVideo(MultipartFile file);

    StoredFile storeCover(MultipartFile file);
}
