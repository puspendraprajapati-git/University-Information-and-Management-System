package com.university.placement.config;

import com.university.placement.entity.Company;
import com.university.placement.entity.JobOpening;
import com.university.placement.entity.PlacementDrive;
import com.university.placement.repository.CompanyRepository;
import com.university.placement.repository.JobOpeningRepository;
import com.university.placement.repository.PlacementDriveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PlacementDataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final PlacementDriveRepository driveRepository;

    @Override
    public void run(String... args) {
        try {
            if (companyRepository.count() == 0) {
                log.info("Seeding initial placement companies, job openings, and campus drives...");

                Company google = companyRepository.save(Company.builder()
                        .name("Google Cloud")
                        .industry("Technology & Cloud Computing")
                        .website("https://cloud.google.com")
                        .logoUrl("https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg")
                        .description("Global technology leader in cloud infrastructure, AI models, and enterprise software.")
                        .hrContactName("Priya Sharma")
                        .hrContactEmail("recruitment-campus@google.com")
                        .build());

                Company microsoft = companyRepository.save(Company.builder()
                        .name("Microsoft")
                        .industry("Software & Enterprise Systems")
                        .website("https://careers.microsoft.com")
                        .logoUrl("https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg")
                        .description("Pioneering personal and enterprise software, Azure cloud solutions, and developer tools.")
                        .hrContactName("David Miller")
                        .hrContactEmail("university-hiring@microsoft.com")
                        .build());

                Company amazon = companyRepository.save(Company.builder()
                        .name("Amazon Web Services")
                        .industry("E-Commerce & Distributed Systems")
                        .website("https://amazon.jobs")
                        .logoUrl("https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg")
                        .description("Global scale e-commerce and cloud infrastructure computing provider.")
                        .hrContactName("Rahul Verma")
                        .hrContactEmail("campus-aws@amazon.com")
                        .build());

                Company infosys = companyRepository.save(Company.builder()
                        .name("Infosys Technologies")
                        .industry("IT Services & Digital Consulting")
                        .website("https://www.infosys.com")
                        .logoUrl("https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg")
                        .description("Leading next-generation digital services and consulting firm.")
                        .hrContactName("Ananya Sen")
                        .hrContactEmail("campus.connect@infosys.com")
                        .build());

                // Seed Job Openings
                jobOpeningRepository.saveAll(List.of(
                        JobOpening.builder()
                                .company(google)
                                .title("Associate Cloud Engineer")
                                .jobDescription("Design, build, and deploy high availability microservices on Google Cloud Platform. Strong foundation in Java, Spring Boot, and Docker.")
                                .eligibility("Min 7.5 CGPA, B.Tech Computer Science / Information Technology, no active backlogs.")
                                .packageLpa(new BigDecimal("18.50"))
                                .deadline(LocalDate.now().plusDays(30))
                                .jobType("Full-Time")
                                .location("Bengaluru / Hyderabad")
                                .minCgpa(new BigDecimal("7.50"))
                                .allowedBranches("Computer Science, Information Technology, CS")
                                .isActive(true)
                                .build(),

                        JobOpening.builder()
                                .company(microsoft)
                                .title("Software Development Engineer I (SDE-1)")
                                .jobDescription("Join our core Azure platform team to engineer resilient backend microservices, REST APIs, and distributed event streaming pipelines.")
                                .eligibility("Min 7.0 CGPA, B.Tech / M.Tech in CS, IT, or Electronics.")
                                .packageLpa(new BigDecimal("16.00"))
                                .deadline(LocalDate.now().plusDays(25))
                                .jobType("Full-Time")
                                .location("Hyderabad / Noida")
                                .minCgpa(new BigDecimal("7.00"))
                                .allowedBranches("Computer Science, Electronics, CS")
                                .isActive(true)
                                .build(),

                        JobOpening.builder()
                                .company(amazon)
                                .title("Full Stack Web Developer Intern")
                                .jobDescription("6-month internship building customer-facing React interfaces and high-performance microservices. Potential for full-time conversion.")
                                .eligibility("Min 6.5 CGPA, All engineering departments eligible.")
                                .packageLpa(new BigDecimal("8.00"))
                                .deadline(LocalDate.now().plusDays(15))
                                .jobType("Internship")
                                .location("Bengaluru")
                                .minCgpa(new BigDecimal("6.50"))
                                .allowedBranches("All, Computer Science, CS")
                                .isActive(true)
                                .build(),

                        JobOpening.builder()
                                .company(infosys)
                                .title("Systems Engineer Specialist")
                                .jobDescription("Develop enterprise integration solutions, database optimizations, and web applications using Java Spring Boot and React.")
                                .eligibility("Min 6.0 CGPA, All branches welcome.")
                                .packageLpa(new BigDecimal("6.25"))
                                .deadline(LocalDate.now().plusDays(40))
                                .jobType("Full-Time")
                                .location("Pune / Chennai / Bengaluru")
                                .minCgpa(new BigDecimal("6.00"))
                                .allowedBranches("All, Computer Science, CS")
                                .isActive(true)
                                .build()
                ));

                // Seed Placement Drives
                driveRepository.saveAll(List.of(
                        PlacementDrive.builder()
                                .company(google)
                                .driveDate(LocalDate.now().plusDays(14))
                                .venue("Main Auditorium & Computer Lab 3")
                                .status(PlacementDrive.DriveStatus.UPCOMING)
                                .description("Annual on-campus placement drive for Google Cloud Engineering.")
                                .roundsInfo("Round 1: Online Coding Test (90 mins), Round 2: Technical Interview, Round 3: Cloud Design & HR")
                                .build(),

                        PlacementDrive.builder()
                                .company(microsoft)
                                .driveDate(LocalDate.now().plusDays(21))
                                .venue("Engineering Block A, Seminar Hall")
                                .status(PlacementDrive.DriveStatus.UPCOMING)
                                .description("Campus hiring drive for Azure and Office 365 engineering teams.")
                                .roundsInfo("Round 1: DSA Assessment, Round 2: System Design, Round 3: Hiring Manager")
                                .build(),

                        PlacementDrive.builder()
                                .company(infosys)
                                .driveDate(LocalDate.now().plusDays(35))
                                .venue("Campus Convention Center")
                                .status(PlacementDrive.DriveStatus.UPCOMING)
                                .description("InfyTQ & Campus Hiring for Systems Engineer and Specialist roles.")
                                .roundsInfo("Round 1: Aptitude & Coding, Round 2: Technical & HR Discussion")
                                .build()
                ));

                log.info("Placement seed data created successfully!");
            }
        } catch (Exception e) {
            log.warn("PlacementDataInitializer note: " + e.getMessage());
        }
    }
}
