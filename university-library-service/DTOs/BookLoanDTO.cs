using System;

namespace UniversityLibraryService.DTOs
{
    /// <summary>
    /// Detailed DTO for a book checkout loan transaction.
    /// </summary>
    public class BookLoanDTO
    {
        public long LoanId { get; set; }
        public long CopyId { get; set; }
        public string AccessionNo { get; set; } = string.Empty;
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthor { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public string Category { get; set; } = string.Empty;

        // Student details
        public long StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? EnrollmentNo { get; set; }
        public string? DepartmentName { get; set; }

        // Loan timeframe
        public DateTime IssuedAt { get; set; }
        public DateTime DueAt { get; set; }
        public DateTime? ReturnedAt { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, RETURNED, OVERDUE
        public int OverdueDays { get; set; }
        public decimal FineAmount { get; set; }
        public string? FineStatus { get; set; }
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// Request payload to issue a physical book copy to a student.
    /// </summary>
    public class IssueBookReqDTO
    {
        public long CopyId { get; set; }
        public long StudentId { get; set; }
        public int LoanDays { get; set; } = 14; // Default standard university loan period
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// Request payload when returning a book.
    /// </summary>
    public class ReturnBookReqDTO
    {
        public long LoanId { get; set; }
        public string? Remarks { get; set; }
    }
}
