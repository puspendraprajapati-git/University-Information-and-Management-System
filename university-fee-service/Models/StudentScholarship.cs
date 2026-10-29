using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityFeeService.Models
{
    [Table("student_scholarships")]
    public class StudentScholarship
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("scholarship_id")]
        public long ScholarshipId { get; set; }

        [Column("awarded_at")]
        public DateTime AwardedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, EXPIRED, REVOKED

        [ForeignKey("ScholarshipId")]
        public virtual Scholarship? Scholarship { get; set; }
    }
}
