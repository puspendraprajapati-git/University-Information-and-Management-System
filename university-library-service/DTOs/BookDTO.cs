using System;
using System.Collections.Generic;

namespace UniversityLibraryService.DTOs
{
    /// <summary>
    /// Data Transfer Object representing a book title along with stock inventory metrics.
    /// </summary>
    public class BookDTO
    {
        public long BookId { get; set; }
        public string Isbn { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        // Inventory metrics
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public int IssuedCopies { get; set; }
        public int ReservedCopies { get; set; }

        // Physical copies list
        public List<BookCopyDTO> Copies { get; set; } = new();
    }

    /// <summary>
    /// DTO for creating or updating a book catalog record.
    /// </summary>
    public class BookCreateDTO
    {
        public string Isbn { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Category { get; set; } = "Computer Science";
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }

        // Optional initial copies to generate automatically
        public int InitialCopies { get; set; } = 2;
        public string? InitialRackLocation { get; set; } = "Rack A-1, Shelf 2";
    }
}
