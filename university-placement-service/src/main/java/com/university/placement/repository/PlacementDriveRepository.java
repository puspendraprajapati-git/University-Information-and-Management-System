package com.university.placement.repository;

import com.university.placement.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {

    List<PlacementDrive> findByCompany_CompanyId(Long companyId);

    List<PlacementDrive> findByStatus(PlacementDrive.DriveStatus status);

    List<PlacementDrive> findByOrderByDriveDateDesc();
}
