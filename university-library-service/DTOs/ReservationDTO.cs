using System;

namespace UniversityLibraryService.DTOs
{
    /// <summary>
    /// DTO representing a student book reservation.
    /// </summary>
    public class ReservationDTO
    {
        public long ReservationId { get; set; }
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthor { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }

        public long StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? EnrollmentNo { get; set; }

        public DateTime ReservedAt { get; set; }
        public string Status { get; set; } = "PENDING";
        public DateTime? ExpiresAt { get; set; }
        public string? Notes { get; set; }
        public int QueuePosition { get; set; }
    }

    /// <summary>
    /// Request to place a book reservation.
    /// </summary>
    public class ReservationReqDTO
    {
        public long BookId { get; set; }
        public long StudentId { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO representing late return or damage fine.
    /// </summary>
    public class FineDTO
    {
        public long FineId { get; set; }
        public long LoanId { get; set; }
        public long StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? BookTitle { get; set; }
        public string? AccessionNo { get; set; }

        public decimal Amount { get; set; }
        public string Status { get; set; } = "UNPAID"; // UNPAID, PAID, WAIVED
        public DateTime? PaidAt { get; set; }
        public string? FineReason { get; set; }
        public string? PaymentRef { get; set; }
    }

    /// <summary>
    /// Global library executive statistics for librarian dashboard.
    /// </summary>
    public class LibraryStatsDTO
    {
        public int TotalTitles { get; set; }
        public int TotalPhysicalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public int IssuedCopies { get; set; }
        public int ActiveLoansCount { get; set; }
        public int OverdueLoansCount { get; set; }
        public int PendingReservationsCount { get; set; }
        public decimal TotalUnpaidFines { get; set; }
    }
}
