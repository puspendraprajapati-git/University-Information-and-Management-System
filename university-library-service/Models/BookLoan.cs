using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace UniversityLibraryService.Models
{
    /// <summary>
    /// Tracks the lending lifecycle of a physical book copy issued to a university student.
    /// Captures issue date, due date, actual return date, and active/overdue state.
    /// </summary>
    [Table("book_loans")]
    public class BookLoan
    {
        [Key]
        [Column("loan_id")]
        public long LoanId { get; set; }

        [Required]
        [Column("copy_id")]
        public long CopyId { get; set; }

        [Required]
        [Column("student_id")]
        public long StudentId { get; set; }

        [Required]
        [Column("issued_at")]
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("due_at")]
        public DateTime DueAt { get; set; }

        [Column("returned_at")]
        public DateTime? ReturnedAt { get; set; }

        /// <summary>
        /// Status: ACTIVE, RETURNED, OVERDUE
        /// </summary>
        [Required]
        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "ACTIVE";

        [Column("remarks", TypeName = "TEXT")]
        public string? Remarks { get; set; }

        // Navigation to physical copy borrowed
        [ForeignKey("CopyId")]
        public virtual BookCopy? Copy { get; set; }

        // Fine associated with this loan (if overdue)
        [JsonIgnore]
        public virtual LibraryFine? Fine { get; set; }
    }
}
