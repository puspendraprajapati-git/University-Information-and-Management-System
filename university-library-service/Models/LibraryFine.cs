using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityLibraryService.Models
{
    /// <summary>
    /// Tracks disciplinary or late return fines automatically levied on overdue library book loans.
    /// Supports fine settlement, waiver, or tracking payment reference.
    /// </summary>
    [Table("library_fines")]
    public class LibraryFine
    {
        [Key]
        [Column("fine_id")]
        public long FineId { get; set; }

        [Required]
        [Column("loan_id")]
        public long LoanId { get; set; }

        [Required]
        [Column("amount", TypeName = "DECIMAL(10, 2)")]
        public decimal Amount { get; set; }

        /// <summary>
        /// Status: UNPAID, PAID, WAIVED
        /// </summary>
        [Required]
        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "UNPAID";

        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }

        [MaxLength(255)]
        [Column("fine_reason")]
        public string? FineReason { get; set; }

        [MaxLength(100)]
        [Column("payment_ref")]
        public string? PaymentRef { get; set; }

        // Navigation to parent loan record
        [ForeignKey("LoanId")]
        public virtual BookLoan? Loan { get; set; }
    }
}
