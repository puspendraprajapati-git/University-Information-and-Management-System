using System;

namespace UniversityLibraryService.DTOs
{
    /// <summary>
    /// Represents a specific physical copy of a book with its barcode / accession number.
    /// </summary>
    public class BookCopyDTO
    {
        public long CopyId { get; set; }
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthor { get; set; } = string.Empty;
        public string AccessionNo { get; set; } = string.Empty;
        public string Status { get; set; } = "AVAILABLE";
        public string? RackLocation { get; set; }
        public DateTime CreatedAt { get; set; }

        // If currently checked out
        public long? CurrentLoanId { get; set; }
        public long? CurrentStudentId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    /// <summary>
    /// DTO for registering a new physical copy to an existing book title.
    /// </summary>
    public class BookCopyCreateDTO
    {
        public long BookId { get; set; }
        public string? AccessionNo { get; set; } // Auto-generated if blank
        public string? RackLocation { get; set; } = "Main Library Stacks";
        public string Status { get; set; } = "AVAILABLE";
    }
}
