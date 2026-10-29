package com.university.lms.controller;

import com.university.lms.dto.ResourceRespDTO;
import com.university.lms.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/lms/resources", "/resources"})
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /*
     * URI - /lms/resources
     * Method - POST (Multipart)
     * Params - subjectId, uploadedBy, title, resourceType, file
     * Success resp - SC 201 + ResourceRespDTO
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResourceRespDTO> uploadResource(
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("uploadedBy") Long uploadedBy,
            @RequestParam("title") String title,
            @RequestParam(value = "resourceType", defaultValue = "PDF") String resourceType,
            @RequestParam("file") MultipartFile file) {
        System.out.println("in upload resource: subjectId=" + subjectId + ", title=" + title);
        return new ResponseEntity<>(
                resourceService.uploadResource(subjectId, uploadedBy, title, resourceType, file),
                HttpStatus.CREATED
        );
    }

    /*
     * URI - /lms/resources/subject/{subjectId}
     * Method - GET
     * Success resp - SC 200 + List<ResourceRespDTO>
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<ResourceRespDTO>> getResourcesBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(resourceService.getResourcesBySubject(subjectId));
    }

    /*
     * URI - /lms/resources
     * Method - GET
     * Success resp - SC 200 + List<ResourceRespDTO>
     */
    @GetMapping
    public ResponseEntity<List<ResourceRespDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    /*
     * URI - /lms/resources/{id}
     * Method - GET
     * Success resp - SC 200 + ResourceRespDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceRespDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /*
     * URI - /lms/resources/download/{id}
     * Method - GET
     * Success resp - SC 200 + Resource (File stream)
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadResourceFile(@PathVariable Long id) {
        Resource resource = resourceService.getResourceFile(id);
        String fileName = resourceService.getResourceOriginalFileName(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    /*
     * URI - /lms/resources/{id}
     * Method - DELETE
     * Success resp - SC 200
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }
}
