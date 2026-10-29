using System.Collections.Generic;
using System.Threading.Tasks;
using UniversityLibraryService.DTOs;

namespace UniversityLibraryService.Services
{
    /// <summary>
    /// Service contract defining operations for books, copies, lending, reservations, and fines.
    /// </summary>
    public interface ILibraryService
    {
        // --- Book Catalog Management ---
        Task<List<BookDTO>> GetAllBooksAsync(string? search = null, string? category = null);
        Task<BookDTO?> GetBookByIdAsync(long bookId);
        Task<BookDTO> CreateBookAsync(BookCreateDTO dto);
        Task<BookDTO?> UpdateBookAsync(long bookId, BookCreateDTO dto);
        Task<bool> DeleteBookAsync(long bookId);
        Task<List<string>> GetCategoriesAsync();

        // --- Physical Copies Inventory ---
        Task<List<BookCopyDTO>> GetCopiesByBookIdAsync(long bookId);
        Task<BookCopyDTO> AddBookCopyAsync(BookCopyCreateDTO dto);
        Task<bool> UpdateCopyStatusAsync(long copyId, string status, string? rackLocation);
        Task<bool> DeleteBookCopyAsync(long copyId);

        // --- Circulation: Book Issuing & Returns ---
        Task<BookLoanDTO> IssueBookAsync(IssueBookReqDTO dto);
        Task<BookLoanDTO> ReturnBookAsync(ReturnBookReqDTO dto);
        Task<List<BookLoanDTO>> GetLoansByStudentAsync(long studentId, bool? activeOnly = null);
        Task<List<BookLoanDTO>> GetAllLoansAsync(string? status = null);
        Task<List<BookLoanDTO>> GetOverdueLoansAsync();
        Task<int> SendOverdueRemindersAsync();

        // --- Reservations ---
        Task<ReservationDTO> CreateReservationAsync(ReservationReqDTO dto);
        Task<List<ReservationDTO>> GetAllReservationsAsync(string? status = null);
        Task<List<ReservationDTO>> GetReservationsByStudentAsync(long studentId);
        Task<List<ReservationDTO>> GetReservationsByBookAsync(long bookId);
        Task<bool> CancelReservationAsync(long reservationId);
        Task<bool> FulfillReservationAsync(long reservationId, long? copyId = null);

        // --- Fines ---
        Task<List<FineDTO>> GetFinesByStudentAsync(long studentId);
        Task<List<FineDTO>> GetAllFinesAsync(string? status = null);
        Task<FineDTO> PayFineAsync(long fineId, string? paymentRef = null);
        Task<FineDTO> WaiveFineAsync(long fineId, string reason);

        // --- Statistics & Overview ---
        Task<LibraryStatsDTO> GetLibraryStatsAsync();
    }
}
