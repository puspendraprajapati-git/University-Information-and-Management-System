namespace UniversityFeeService.DTOs
{
    public class FeeStructureReqDTO
    {
        public long DeptId { get; set; }
        public long SemesterId { get; set; }
        public string FeeType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string AcademicYear { get; set; } = "2026-2027";
    }

    public class FeeStructureRespDTO
    {
        public long FeeStructureId { get; set; }
        public long DeptId { get; set; }
        public long SemesterId { get; set; }
        public string FeeType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
    }
}
