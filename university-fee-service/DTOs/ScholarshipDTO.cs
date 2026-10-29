using System;

namespace UniversityFeeService.DTOs
{
    public class ScholarshipReqDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? EligibilityCriteria { get; set; }
        public decimal Amount { get; set; }
    }

    public class AwardScholarshipReqDTO
    {
        public long StudentId { get; set; }
        public long ScholarshipId { get; set; }
    }

    public class StudentScholarshipRespDTO
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public long ScholarshipId { get; set; }
        public string ScholarshipName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime AwardedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
