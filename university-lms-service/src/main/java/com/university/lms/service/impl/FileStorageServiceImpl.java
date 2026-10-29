package com.university.lms.service.impl;

import com.university.lms.exception.ResourceNotFoundException;
import com.university.lms.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${lms.upload.dir:./uploads/lms}")
    private String baseUploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            rootLocation = Paths.get(baseUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("submissions"));
            Files.createDirectories(rootLocation.resolve("resources"));
            log.info("LMS upload directories initialized at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize LMS storage folder!", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subfolder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String rawName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String sanitizedName = rawName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + sanitizedName;

        try {
            Path targetFolder = rootLocation.resolve(subfolder).normalize();
            Files.createDirectories(targetFolder);

            Path targetPath = targetFolder.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return subfolder + "/" + uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + uniqueFileName, e);
        }
    }

    @Override
    public Resource loadFileAsResource(String relativeFilePath) {
        try {
            Path filePath = rootLocation.resolve(relativeFilePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or unreadable: " + relativeFilePath);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File path is invalid: " + relativeFilePath);
        }
    }

    @Override
    public void deleteFile(String relativeFilePath) {
        try {
            Path filePath = rootLocation.resolve(relativeFilePath).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file at {}: {}", relativeFilePath, e.getMessage());
        }
    }
}
