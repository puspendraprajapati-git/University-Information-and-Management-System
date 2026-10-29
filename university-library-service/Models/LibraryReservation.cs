using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityLibraryService.Models
{
    /// <summary>
    /// Represents a student hold/reservation placed on a book title when all physical copies are checked out.
    /// When any copy is returned, the reservation can be fulfilled in queue priority order.
    /// </summary>
    [Table("library_reservations")]
    public class LibraryReservation
    {
        [Key]
        [Column("reservation_id")]
        public long ReservationId { get; set; }

        [Required]
        [Column("book_id")]
        public long BookId { get; set; }

        [Required]
        [Column("student_id")]
        public long StudentId { get; set; }

        [Required]
        [Column("reserved_at")]
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Status: PENDING, FULFILLED, CANCELLED, EXPIRED
        /// </summary>
        [Required]
        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "PENDING";

        [Column("expires_at")]
        public DateTime? ExpiresAt { get; set; }

        [Column("notes", TypeName = "TEXT")]
        public string? Notes { get; set; }

        // Navigation to book reserved
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }
    }
}
