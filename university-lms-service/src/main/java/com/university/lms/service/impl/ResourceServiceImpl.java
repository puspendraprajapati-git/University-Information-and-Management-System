package com.university.lms.service.impl;

import com.university.lms.dto.ResourceRespDTO;
import com.university.lms.entity.LearningResource;
import com.university.lms.exception.ResourceNotFoundException;
import com.university.lms.repository.ResourceRepository;
import com.university.lms.service.FileStorageService;
import com.university.lms.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;

    @Override
    public ResourceRespDTO uploadResource(Long subjectId, Long uploadedBy, String title, String resourceType, MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resource";
        String storedFilePath = fileStorageService.storeFile(file, "resources");

        LearningResource resource = LearningResource.builder()
                .subjectId(subjectId)
                .uploadedBy(uploadedBy)
                .title(title)
                .fileName(originalName)
                .filePath(storedFilePath)
                .resourceType(resourceType != null ? resourceType.toUpperCase() : "GENERAL")
                .build();

        LearningResource saved = resourceRepository.save(resource);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceRespDTO> getResourcesBySubject(Long subjectId) {
        return resourceRepository.findBySubjectIdOrderByUploadedAtDesc(subjectId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceRespDTO> getAllResources() {
        return resourceRepository.findAllByOrderByUploadedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceRespDTO getResourceById(Long resourceId) {
        LearningResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        return mapToDTO(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getResourceFile(Long resourceId) {
        LearningResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        return fileStorageService.loadFileAsResource(resource.getFilePath());
    }

    @Override
    @Transactional(readOnly = true)
    public String getResourceOriginalFileName(Long resourceId) {
        LearningResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        return resource.getFileName() != null ? resource.getFileName() : "resource";
    }

    @Override
    public void deleteResource(Long resourceId) {
        LearningResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        if (resource.getFilePath() != null) {
            fileStorageService.deleteFile(resource.getFilePath());
        }
        resourceRepository.deleteById(resourceId);
    }

    private ResourceRespDTO mapToDTO(LearningResource r) {
        return ResourceRespDTO.builder()
                .resourceId(r.getResourceId())
                .subjectId(r.getSubjectId())
                .uploadedBy(r.getUploadedBy())
                .title(r.getTitle())
                .fileName(r.getFileName())
                .resourceType(r.getResourceType())
                .downloadUrl("/lms/resources/download/" + r.getResourceId())
                .uploadedAt(r.getUploadedAt())
                .build();
    }
}
