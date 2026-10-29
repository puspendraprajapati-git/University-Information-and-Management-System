package com.university.lms.service;

import com.university.lms.dto.ResourceRespDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {

    ResourceRespDTO uploadResource(Long subjectId, Long uploadedBy, String title, String resourceType, MultipartFile file);

    List<ResourceRespDTO> getResourcesBySubject(Long subjectId);

    List<ResourceRespDTO> getAllResources();

    ResourceRespDTO getResourceById(Long resourceId);

    Resource getResourceFile(Long resourceId);

    String getResourceOriginalFileName(Long resourceId);

    void deleteResource(Long resourceId);
}
