using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityFeeService.Models
{
    [Table("fee_structures")]
    public class FeeStructure
    {
        [Key]
        [Column("fee_structure_id")]
        public long FeeStructureId { get; set; }

        [Column("dept_id")]
        public long DeptId { get; set; }

        [Column("semester_id")]
        public long SemesterId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("fee_type")]
        public string FeeType { get; set; } = string.Empty; // Tuition, Library, Lab, Hostel, Exam

        [Column("amount", TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [MaxLength(20)]
        [Column("academic_year")]
        public string AcademicYear { get; set; } = "2026-2027";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
