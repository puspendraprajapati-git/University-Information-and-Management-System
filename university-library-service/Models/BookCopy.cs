using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace UniversityLibraryService.Models
{
    /// <summary>
    /// Represents an individual physical copy of a book with its unique barcode/accession number.
    /// This separation allows the university library to stock multiple identical copies with independent statuses.
    /// </summary>
    [Table("book_copies")]
    public class BookCopy
    {
        [Key]
        [Column("copy_id")]
        public long CopyId { get; set; }

        [Required]
        [Column("book_id")]
        public long BookId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("accession_no")]
        public string AccessionNo { get; set; } = string.Empty;

        /// <summary>
        /// Status can be: AVAILABLE, ISSUED, RESERVED, MAINTENANCE, LOST
        /// </summary>
        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "AVAILABLE";

        [MaxLength(100)]
        [Column("rack_location")]
        public string? RackLocation { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation to parent title
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        // Loan history for this physical copy
        [JsonIgnore]
        public virtual ICollection<BookLoan> Loans { get; set; } = new List<BookLoan>();
    }
}
