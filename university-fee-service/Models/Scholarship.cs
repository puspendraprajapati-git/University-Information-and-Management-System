using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityFeeService.Models
{
    [Table("scholarships")]
    public class Scholarship
    {
        [Key]
        [Column("scholarship_id")]
        public long ScholarshipId { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("eligibility_criteria")]
        public string? EligibilityCriteria { get; set; }

        [Column("amount", TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }
    }
}
