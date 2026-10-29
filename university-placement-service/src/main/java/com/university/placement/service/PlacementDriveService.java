package com.university.placement.service;

import com.university.placement.dto.PlacementDriveDTO;
import com.university.placement.entity.Company;
import com.university.placement.entity.PlacementDrive;
import com.university.placement.repository.CompanyRepository;
import com.university.placement.repository.PlacementDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementDriveService {

    private final PlacementDriveRepository driveRepository;
    private final CompanyRepository companyRepository;

    public List<PlacementDriveDTO> getAllDrives() {
        return driveRepository.findByOrderByDriveDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PlacementDriveDTO> getUpcomingDrives() {
        return driveRepository.findByStatus(PlacementDrive.DriveStatus.UPCOMING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PlacementDriveDTO getDriveById(Long id) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Placement drive not found: " + id));
        return mapToDTO(drive);
    }

    @Transactional
    public PlacementDrive scheduleDrive(PlacementDriveDTO dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found: " + dto.getCompanyId()));

        PlacementDrive.DriveStatus status = PlacementDrive.DriveStatus.UPCOMING;
        if (dto.getStatus() != null) {
            try {
                status = PlacementDrive.DriveStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        PlacementDrive drive = PlacementDrive.builder()
                .company(company)
                .driveDate(dto.getDriveDate())
                .venue(dto.getVenue())
                .status(status)
                .description(dto.getDescription())
                .roundsInfo(dto.getRoundsInfo())
                .build();

        return driveRepository.save(drive);
    }

    @Transactional
    public PlacementDrive updateDrive(Long id, PlacementDriveDTO dto) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Placement drive not found: " + id));

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found: " + dto.getCompanyId()));
            drive.setCompany(company);
        }

        drive.setDriveDate(dto.getDriveDate());
        drive.setVenue(dto.getVenue());
        if (dto.getStatus() != null) {
            try {
                drive.setStatus(PlacementDrive.DriveStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }
        drive.setDescription(dto.getDescription());
        drive.setRoundsInfo(dto.getRoundsInfo());

        return driveRepository.save(drive);
    }

    @Transactional
    public void deleteDrive(Long id) {
        if (!driveRepository.existsById(id)) {
            throw new RuntimeException("Placement drive not found: " + id);
        }
        driveRepository.deleteById(id);
    }

    private PlacementDriveDTO mapToDTO(PlacementDrive drive) {
        Company company = drive.getCompany();
        return PlacementDriveDTO.builder()
                .driveId(drive.getDriveId())
                .companyId(company.getCompanyId())
                .companyName(company.getName())
                .companyWebsite(company.getWebsite())
                .companyIndustry(company.getIndustry())
                .companyLogoUrl(company.getLogoUrl())
                .driveDate(drive.getDriveDate())
                .venue(drive.getVenue())
                .status(drive.getStatus().name())
                .description(drive.getDescription())
                .roundsInfo(drive.getRoundsInfo())
                .createdAt(drive.getCreatedAt())
                .build();
    }
}
