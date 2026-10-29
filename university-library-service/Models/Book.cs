using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace UniversityLibraryService.Models
{
    /// <summary>
    /// Represents the abstract catalog metadata for a book in the university library.
    /// Physical copies are maintained separately in the BookCopy entity.
    /// </summary>
    [Table("books")]
    public class Book
    {
        [Key]
        [Column("book_id")]
        public long BookId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("isbn")]
        public string Isbn { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("author")]
        public string Author { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [MaxLength(150)]
        [Column("publisher")]
        public string? Publisher { get; set; }

        [Column("publication_year")]
        public int? PublicationYear { get; set; }

        [Column("description", TypeName = "TEXT")]
        public string? Description { get; set; }

        [MaxLength(500)]
        [Column("cover_image_url")]
        public string? CoverImageUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property to physical copies owned by the university
        [JsonIgnore]
        public virtual ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();

        // Navigation property to student reservations for this title
        [JsonIgnore]
        public virtual ICollection<LibraryReservation> Reservations { get; set; } = new List<LibraryReservation>();
    }
}
