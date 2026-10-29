using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniversityLibraryService.Data;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Models;

namespace UniversityLibraryService.Services
{
    /// <summary>
    /// Implements library domain business logic including physical inventory tracking,
    /// circulation lending, fine calculation, hold reservations, and automated reminders.
    /// </summary>
    public class LibraryService : ILibraryService
    {
        private readonly LibraryDbContext _db;
        private readonly ILogger<LibraryService> _logger;

        // Standard overdue fine rate per day in Indian Rupees (₹5.00 / day)
        private const decimal DAILY_FINE_RATE = 5.00m;

        public LibraryService(LibraryDbContext db, ILogger<LibraryService> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ==========================================
        // 1. BOOK CATALOG MANAGEMENT
        // ==========================================

        /// <summary>
        /// Retrieves all book titles with search filtering across title, author, isbn, and category.
        /// Aggregates real-time copy counts (total, available, issued).
        /// </summary>
        public async Task<List<BookDTO>> GetAllBooksAsync(string? search = null, string? category = null)
        {
            var query = _db.Books.Include(b => b.Copies).AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("ALL", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(b => b.Title.ToLower().Contains(s) ||
                                         b.Author.ToLower().Contains(s) ||
                                         b.Isbn.ToLower().Contains(s));
            }

            var books = await query.OrderByDescending(b => b.BookId).ToListAsync();

            return books.Select(b => MapToBookDTO(b)).ToList();
        }

        /// <summary>
        /// Fetches a single book by ID along with its list of physical copies and rack locations.
        /// </summary>
        public async Task<BookDTO?> GetBookByIdAsync(long bookId)
        {
            var book = await _db.Books
                .Include(b => b.Copies)
                .FirstOrDefaultAsync(b => b.BookId == bookId);

            return book == null ? null : MapToBookDTO(book);
        }

        /// <summary>
        /// Registers a new book catalog title and optionally generates initial physical copies.
        /// </summary>
        public async Task<BookDTO> CreateBookAsync(BookCreateDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("Book title is required.");

            if (string.IsNullOrWhiteSpace(dto.Isbn))
                dto.Isbn = "978-" + Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper();

            var book = new Book
            {
                Isbn = dto.Isbn.Trim(),
                Title = dto.Title.Trim(),
                Author = dto.Author.Trim(),
                Category = string.IsNullOrWhiteSpace(dto.Category) ? "General Engineering" : dto.Category.Trim(),
                Publisher = dto.Publisher?.Trim(),
                PublicationYear = dto.PublicationYear,
                Description = dto.Description?.Trim(),
                CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl)
                    ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80"
                    : dto.CoverImageUrl.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Books.Add(book);
            await _db.SaveChangesAsync();

            // Automatically generate physical copies if specified
            int copiesToGenerate = Math.Clamp(dto.InitialCopies, 1, 10);
            for (int i = 1; i <= copiesToGenerate; i++)
            {
                string copyCode = $"ACC-{book.BookId:D3}-{i:D2}";
                _db.BookCopies.Add(new BookCopy
                {
                    BookId = book.BookId,
                    AccessionNo = copyCode,
                    Status = "AVAILABLE",
                    RackLocation = dto.InitialRackLocation ?? "Main Library - Stacks",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();

            return (await GetBookByIdAsync(book.BookId))!;
        }

        /// <summary>
        /// Updates catalog metadata for an existing title.
        /// </summary>
        public async Task<BookDTO?> UpdateBookAsync(long bookId, BookCreateDTO dto)
        {
            var book = await _db.Books.FindAsync(bookId);
            if (book == null) return null;

            book.Title = dto.Title.Trim();
            book.Author = dto.Author.Trim();
            book.Category = dto.Category.Trim();
            book.Publisher = dto.Publisher?.Trim();
            book.PublicationYear = dto.PublicationYear;
            book.Description = dto.Description?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.CoverImageUrl))
            {
                book.CoverImageUrl = dto.CoverImageUrl.Trim();
            }

            await _db.SaveChangesAsync();
            return await GetBookByIdAsync(bookId);
        }

        /// <summary>
        /// Deletes a book and all associated copies/loans.
        /// </summary>
        public async Task<bool> DeleteBookAsync(long bookId)
        {
            var book = await _db.Books.FindAsync(bookId);
            if (book == null) return false;

            _db.Books.Remove(book);
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Retrieves distinct categories for catalog filter dropdowns.
        /// </summary>
        public async Task<List<string>> GetCategoriesAsync()
        {
            return await _db.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        // ==========================================
        // 2. PHYSICAL COPIES MANAGEMENT
        // ==========================================

        /// <summary>
        /// Gets all physical copies associated with a particular book ID.
        /// </summary>
        public async Task<List<BookCopyDTO>> GetCopiesByBookIdAsync(long bookId)
        {
            var copies = await _db.BookCopies
                .Include(c => c.Book)
                .Include(c => c.Loans)
                .Where(c => c.BookId == bookId)
                .OrderBy(c => c.AccessionNo)
                .ToListAsync();

            return copies.Select(c => MapToCopyDTO(c)).ToList();
        }

        /// <summary>
        /// Adds a single physical copy to a book title with a unique accession barcode.
        /// </summary>
        public async Task<BookCopyDTO> AddBookCopyAsync(BookCopyCreateDTO dto)
        {
            var book = await _db.Books.FindAsync(dto.BookId)
                ?? throw new KeyNotFoundException($"Book title #{dto.BookId} not found.");

            string accession = dto.AccessionNo?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(accession))
            {
                int count = await _db.BookCopies.CountAsync(c => c.BookId == dto.BookId);
                accession = $"ACC-{dto.BookId:D3}-{(count + 1):D2}";
            }

            // Ensure accession number uniqueness
            if (await _db.BookCopies.AnyAsync(c => c.AccessionNo == accession))
            {
                accession += "-" + Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper();
            }

            var copy = new BookCopy
            {
                BookId = dto.BookId,
                AccessionNo = accession,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "AVAILABLE" : dto.Status.ToUpper(),
                RackLocation = dto.RackLocation ?? "Stacks Floor 1",
                CreatedAt = DateTime.UtcNow
            };

            _db.BookCopies.Add(copy);
            await _db.SaveChangesAsync();

            copy.Book = book;
            return MapToCopyDTO(copy);
        }

        /// <summary>
        /// Updates the status or rack location of a physical copy (e.g. MAINTENANCE, LOST, AVAILABLE).
        /// </summary>
        public async Task<bool> UpdateCopyStatusAsync(long copyId, string status, string? rackLocation)
        {
            var copy = await _db.BookCopies.FindAsync(copyId);
            if (copy == null) return false;

            copy.Status = status.ToUpper();
            if (!string.IsNullOrWhiteSpace(rackLocation))
            {
                copy.RackLocation = rackLocation.Trim();
            }

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Removes a physical copy.
        /// </summary>
        public async Task<bool> DeleteBookCopyAsync(long copyId)
        {
            var copy = await _db.BookCopies.FindAsync(copyId);
            if (copy == null) return false;

            // Check if currently checked out
            if (copy.Status == "ISSUED")
                throw new InvalidOperationException("Cannot delete copy while currently issued to a student.");

            _db.BookCopies.Remove(copy);
            await _db.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // 3. CIRCULATION: ISSUING & RETURNS
        // ==========================================

        /// <summary>
        /// Issues an available physical copy to a student.
        /// Enforces copy availability, sets due date, and updates copy status to ISSUED.
        /// </summary>
        public async Task<BookLoanDTO> IssueBookAsync(IssueBookReqDTO dto)
        {
            var copy = await _db.BookCopies
                .Include(c => c.Book)
                .FirstOrDefaultAsync(c => c.CopyId == dto.CopyId)
                ?? throw new KeyNotFoundException($"Book copy #{dto.CopyId} not found.");

            if (copy.Status != "AVAILABLE")
            {
                throw new InvalidOperationException($"Physical copy '{copy.AccessionNo}' is not available (Current status: {copy.Status}).");
            }

            // Standard lending period (defaults to 14 days)
            int days = dto.LoanDays > 0 ? dto.LoanDays : 14;
            var issueDate = DateTime.UtcNow;
            var dueDate = issueDate.AddDays(days);

            var loan = new BookLoan
            {
                CopyId = copy.CopyId,
                StudentId = dto.StudentId,
                IssuedAt = issueDate,
                DueAt = dueDate,
                Status = "ACTIVE",
                Remarks = dto.Remarks?.Trim()
            };

            // Update physical copy status
            copy.Status = "ISSUED";

            _db.BookLoans.Add(loan);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Issued book copy '{AccessionNo}' to Student #{StudentId}. Due on: {DueAt:yyyy-MM-dd}",
                copy.AccessionNo, dto.StudentId, dueDate);

            return await GetLoanByIdAsync(loan.LoanId);
        }

        /// <summary>
        /// Processes a book return.
        /// Calculates overdue duration, generates disciplinary fine if late, and updates copy status.
        /// Also checks pending reservations to allocate copy if queued.
        /// </summary>
        public async Task<BookLoanDTO> ReturnBookAsync(ReturnBookReqDTO dto)
        {
            var loan = await _db.BookLoans
                .Include(l => l.Copy)
                .ThenInclude(c => c!.Book)
                .FirstOrDefaultAsync(l => l.LoanId == dto.LoanId)
                ?? throw new KeyNotFoundException($"Loan transaction #{dto.LoanId} not found.");

            if (loan.Status == "RETURNED")
            {
                throw new InvalidOperationException("This book copy has already been returned.");
            }

            var returnDate = DateTime.UtcNow;
            loan.ReturnedAt = returnDate;
            loan.Status = "RETURNED";
            if (!string.IsNullOrWhiteSpace(dto.Remarks))
            {
                loan.Remarks = (loan.Remarks != null ? loan.Remarks + " | " : "") + dto.Remarks;
            }

            // Check if overdue: calculate late days and levy automated fine
            if (returnDate > loan.DueAt)
            {
                int overdueDays = (int)Math.Ceiling((returnDate - loan.DueAt).TotalDays);
                if (overdueDays > 0)
                {
                    decimal fineAmount = overdueDays * DAILY_FINE_RATE;

                    var fine = new LibraryFine
                    {
                        LoanId = loan.LoanId,
                        Amount = fineAmount,
                        Status = "UNPAID",
                        FineReason = $"Late return fine: {overdueDays} day(s) overdue @ ₹{DAILY_FINE_RATE}/day."
                    };

                    _db.LibraryFines.Add(fine);
                    _logger.LogWarning("Overdue return: Loan #{LoanId} is {Days} days late. Fine of ₹{Amount} levied.",
                        loan.LoanId, overdueDays, fineAmount);
                }
            }

            // Return physical copy to available stock or fulfill pending reservation
            if (loan.Copy != null)
            {
                // Check if any student has an active reservation for this book
                var pendingReservation = await _db.LibraryReservations
                    .Where(r => r.BookId == loan.Copy.BookId && r.Status == "PENDING")
                    .OrderBy(r => r.ReservedAt)
                    .FirstOrDefaultAsync();

                if (pendingReservation != null)
                {
                    // Mark copy as reserved for the queued student
                    loan.Copy.Status = "RESERVED";
                    pendingReservation.Status = "FULFILLED";
                    pendingReservation.Notes = (pendingReservation.Notes ?? "") + $" Copy {loan.Copy.AccessionNo} reserved at circulation desk.";
                }
                else
                {
                    loan.Copy.Status = "AVAILABLE";
                }
            }

            await _db.SaveChangesAsync();

            return await GetLoanByIdAsync(loan.LoanId);
        }

        /// <summary>
        /// Retrieves borrowing history and active loans for a specific student.
        /// </summary>
        public async Task<List<BookLoanDTO>> GetLoansByStudentAsync(long studentId, bool? activeOnly = null)
        {
            var query = _db.BookLoans
                .Include(l => l.Copy)
                .ThenInclude(c => c!.Book)
                .Include(l => l.Fine)
                .Where(l => l.StudentId == studentId);

            if (activeOnly.HasValue && activeOnly.Value)
            {
                query = query.Where(l => l.Status == "ACTIVE" || l.Status == "OVERDUE");
            }

            var loans = await query.OrderByDescending(l => l.IssuedAt).ToListAsync();

            return await EnrichLoansWithStudentNamesAsync(loans);
        }

        /// <summary>
        /// Retrieves all book loans in the system for administrative oversight.
        /// </summary>
        public async Task<List<BookLoanDTO>> GetAllLoansAsync(string? status = null)
        {
            var query = _db.BookLoans
                .Include(l => l.Copy)
                .ThenInclude(c => c!.Book)
                .Include(l => l.Fine)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(l => l.Status == status);
            }

            var loans = await query.OrderByDescending(l => l.IssuedAt).ToListAsync();

            return await EnrichLoansWithStudentNamesAsync(loans);
        }

        /// <summary>
        /// Identifies all currently active loans that have passed their due date.
        /// </summary>
        public async Task<List<BookLoanDTO>> GetOverdueLoansAsync()
        {
            var now = DateTime.UtcNow;
            var loans = await _db.BookLoans
                .Include(l => l.Copy)
                .ThenInclude(c => c!.Book)
                .Include(l => l.Fine)
                .Where(l => l.Status == "ACTIVE" && l.DueAt < now)
                .OrderBy(l => l.DueAt)
                .ToListAsync();

            // Mark status as OVERDUE
            foreach (var l in loans)
            {
                l.Status = "OVERDUE";
            }
            await _db.SaveChangesAsync();

            return await EnrichLoansWithStudentNamesAsync(loans);
        }

        /// <summary>
        /// Flags overdue loans and prepares reminder notifications.
        /// </summary>
        public async Task<int> SendOverdueRemindersAsync()
        {
            var overdueLoans = await GetOverdueLoansAsync();
            _logger.LogInformation("Automated Overdue Check: Flagged {Count} loans past due date.", overdueLoans.Count);
            return overdueLoans.Count;
        }

        // ==========================================
        // 4. RESERVATIONS (HOLDS)
        // ==========================================

        /// <summary>
        /// Places a hold/reservation on a book title when copies are checked out.
        /// </summary>
        public async Task<ReservationDTO> CreateReservationAsync(ReservationReqDTO dto)
        {
            var book = await _db.Books
                .Include(b => b.Copies)
                .FirstOrDefaultAsync(b => b.BookId == dto.BookId)
                ?? throw new KeyNotFoundException($"Book #{dto.BookId} not found.");

            // Check if already reserved
            var existing = await _db.LibraryReservations
                .FirstOrDefaultAsync(r => r.BookId == dto.BookId && r.StudentId == dto.StudentId && r.Status == "PENDING");

            if (existing != null)
            {
                throw new InvalidOperationException("You already have an active pending reservation for this book title.");
            }

            var reservation = new LibraryReservation
            {
                BookId = dto.BookId,
                StudentId = dto.StudentId,
                ReservedAt = DateTime.UtcNow,
                Status = "PENDING",
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Notes = dto.Notes?.Trim()
            };

            _db.LibraryReservations.Add(reservation);
            await _db.SaveChangesAsync();

            // Calculate queue position
            int position = await _db.LibraryReservations
                .CountAsync(r => r.BookId == dto.BookId && r.Status == "PENDING" && r.ReservedAt <= reservation.ReservedAt);

            return new ReservationDTO
            {
                ReservationId = reservation.ReservationId,
                BookId = book.BookId,
                BookTitle = book.Title,
                BookAuthor = book.Author,
                CoverImageUrl = book.CoverImageUrl,
                StudentId = dto.StudentId,
                ReservedAt = reservation.ReservedAt,
                Status = reservation.Status,
                ExpiresAt = reservation.ExpiresAt,
                Notes = reservation.Notes,
                QueuePosition = position
            };
        }

        public async Task<List<ReservationDTO>> GetAllReservationsAsync(string? status = null)
        {
            var query = _db.LibraryReservations
                .Include(r => r.Book)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(r => r.Status == status);
            }

            var reservations = await query.OrderByDescending(r => r.ReservedAt).ToListAsync();

            // Resolve student names from MySQL students table
            var studentIds = reservations.Select(r => r.StudentId).Distinct().ToList();
            var studentDict = new Dictionary<long, (string Name, string RegNo)>();

            if (studentIds.Any())
            {
                try
                {
                    using var command = _db.Database.GetDbConnection().CreateCommand();
                    string inClause = string.Join(",", studentIds);
                    command.CommandText = $"SELECT id, full_name, enrollment_no FROM students WHERE id IN ({inClause});";
                    await _db.Database.OpenConnectionAsync();

                    using var reader = await command.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        long id = reader.GetInt64(0);
                        string name = reader.IsDBNull(1) ? "Student #" + id : reader.GetString(1);
                        string reg = reader.IsDBNull(2) ? "STU-" + id : reader.GetString(2);
                        studentDict[id] = (name, reg);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to resolve student names for reservations overview.");
                }
            }

            return reservations.Select(r =>
            {
                studentDict.TryGetValue(r.StudentId, out var info);
                return new ReservationDTO
                {
                    ReservationId = r.ReservationId,
                    BookId = r.BookId,
                    BookTitle = r.Book?.Title ?? "Book #" + r.BookId,
                    BookAuthor = r.Book?.Author ?? "",
                    CoverImageUrl = r.Book?.CoverImageUrl,
                    StudentId = r.StudentId,
                    StudentName = info.Name ?? "Student #" + r.StudentId,
                    EnrollmentNo = info.RegNo,
                    ReservedAt = r.ReservedAt,
                    Status = r.Status,
                    ExpiresAt = r.ExpiresAt,
                    Notes = r.Notes,
                    QueuePosition = 1
                };
            }).ToList();
        }

        public async Task<bool> FulfillReservationAsync(long reservationId, long? copyId = null)
        {
            var res = await _db.LibraryReservations.FindAsync(reservationId);
            if (res == null) return false;

            if (copyId.HasValue)
            {
                var copy = await _db.BookCopies.FindAsync(copyId.Value);
                if (copy != null)
                {
                    copy.Status = "RESERVED";
                    res.Notes = (res.Notes ?? "") + $" Copy {copy.AccessionNo} reserved for pickup.";
                }
            }

            res.Status = "FULFILLED";
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<ReservationDTO>> GetReservationsByStudentAsync(long studentId)
        {
            var reservations = await _db.LibraryReservations
                .Include(r => r.Book)
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.ReservedAt)
                .ToListAsync();

            var list = new List<ReservationDTO>();
            foreach (var r in reservations)
            {
                int pos = await _db.LibraryReservations
                    .CountAsync(x => x.BookId == r.BookId && x.Status == "PENDING" && x.ReservedAt <= r.ReservedAt);

                list.Add(new ReservationDTO
                {
                    ReservationId = r.ReservationId,
                    BookId = r.BookId,
                    BookTitle = r.Book?.Title ?? "Book #" + r.BookId,
                    BookAuthor = r.Book?.Author ?? "",
                    CoverImageUrl = r.Book?.CoverImageUrl,
                    StudentId = r.StudentId,
                    ReservedAt = r.ReservedAt,
                    Status = r.Status,
                    ExpiresAt = r.ExpiresAt,
                    Notes = r.Notes,
                    QueuePosition = pos
                });
            }
            return list;
        }

        public async Task<List<ReservationDTO>> GetReservationsByBookAsync(long bookId)
        {
            var reservations = await _db.LibraryReservations
                .Include(r => r.Book)
                .Where(r => r.BookId == bookId)
                .OrderBy(r => r.ReservedAt)
                .ToListAsync();

            int rank = 1;
            return reservations.Select(r => new ReservationDTO
            {
                ReservationId = r.ReservationId,
                BookId = r.BookId,
                BookTitle = r.Book?.Title ?? "",
                BookAuthor = r.Book?.Author ?? "",
                CoverImageUrl = r.Book?.CoverImageUrl,
                StudentId = r.StudentId,
                ReservedAt = r.ReservedAt,
                Status = r.Status,
                ExpiresAt = r.ExpiresAt,
                Notes = r.Notes,
                QueuePosition = rank++
            }).ToList();
        }

        public async Task<bool> CancelReservationAsync(long reservationId)
        {
            var res = await _db.LibraryReservations.FindAsync(reservationId);
            if (res == null) return false;

            res.Status = "CANCELLED";
            await _db.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // 5. FINES & PENALTIES
        // ==========================================

        public async Task<List<FineDTO>> GetFinesByStudentAsync(long studentId)
        {
            var fines = await _db.LibraryFines
                .Include(f => f.Loan)
                .ThenInclude(l => l!.Copy)
                .ThenInclude(c => c!.Book)
                .Where(f => f.Loan != null && f.Loan.StudentId == studentId)
                .OrderByDescending(f => f.FineId)
                .ToListAsync();

            return fines.Select(f => MapToFineDTO(f)).ToList();
        }

        public async Task<List<FineDTO>> GetAllFinesAsync(string? status = null)
        {
            var query = _db.LibraryFines
                .Include(f => f.Loan)
                .ThenInclude(l => l!.Copy)
                .ThenInclude(c => c!.Book)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(f => f.Status == status);
            }

            var fines = await query.OrderByDescending(f => f.FineId).ToListAsync();

            // Resolve student names from MySQL students table
            var studentIds = fines.Where(f => f.Loan != null).Select(f => f.Loan!.StudentId).Distinct().ToList();
            var studentDict = new Dictionary<long, (string Name, string RegNo)>();

            if (studentIds.Any())
            {
                try
                {
                    using var command = _db.Database.GetDbConnection().CreateCommand();
                    string inClause = string.Join(",", studentIds);
                    command.CommandText = $"SELECT id, full_name, enrollment_no FROM students WHERE id IN ({inClause});";
                    await _db.Database.OpenConnectionAsync();

                    using var reader = await command.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        long id = reader.GetInt64(0);
                        string name = reader.IsDBNull(1) ? "Student #" + id : reader.GetString(1);
                        string reg = reader.IsDBNull(2) ? "STU-" + id : reader.GetString(2);
                        studentDict[id] = (name, reg);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to resolve student names for fines overview.");
                }
            }

            return fines.Select(f =>
            {
                var dto = MapToFineDTO(f);
                if (studentDict.TryGetValue(dto.StudentId, out var sInfo))
                {
                    dto.StudentName = sInfo.Name;
                }
                return dto;
            }).ToList();
        }

        public async Task<FineDTO> PayFineAsync(long fineId, string? paymentRef = null)
        {
            var fine = await _db.LibraryFines
                .Include(f => f.Loan)
                .ThenInclude(l => l!.Copy)
                .ThenInclude(c => c!.Book)
                .FirstOrDefaultAsync(f => f.FineId == fineId)
                ?? throw new KeyNotFoundException($"Fine record #{fineId} not found.");

            fine.Status = "PAID";
            fine.PaidAt = DateTime.UtcNow;
            fine.PaymentRef = string.IsNullOrWhiteSpace(paymentRef) ? $"LIB-PAY-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}" : paymentRef;

            await _db.SaveChangesAsync();
            return MapToFineDTO(fine);
        }

        public async Task<FineDTO> WaiveFineAsync(long fineId, string reason)
        {
            var fine = await _db.LibraryFines
                .Include(f => f.Loan)
                .ThenInclude(l => l!.Copy)
                .ThenInclude(c => c!.Book)
                .FirstOrDefaultAsync(f => f.FineId == fineId)
                ?? throw new KeyNotFoundException($"Fine record #{fineId} not found.");

            fine.Status = "WAIVED";
            fine.FineReason = (fine.FineReason != null ? fine.FineReason + " | " : "") + "Waived: " + reason;

            await _db.SaveChangesAsync();
            return MapToFineDTO(fine);
        }

        // ==========================================
        // 6. EXECUTIVE DASHBOARD STATISTICS
        // ==========================================

        public async Task<LibraryStatsDTO> GetLibraryStatsAsync()
        {
            int totalBooks = await _db.Books.CountAsync();
            int totalCopies = await _db.BookCopies.CountAsync();
            int availableCopies = await _db.BookCopies.CountAsync(c => c.Status == "AVAILABLE");
            int issuedCopies = await _db.BookCopies.CountAsync(c => c.Status == "ISSUED");

            int activeLoans = await _db.BookLoans.CountAsync(l => l.Status == "ACTIVE" || l.Status == "OVERDUE");
            int overdueLoans = await _db.BookLoans.CountAsync(l => (l.Status == "ACTIVE" || l.Status == "OVERDUE") && l.DueAt < DateTime.UtcNow);

            int pendingReservations = await _db.LibraryReservations.CountAsync(r => r.Status == "PENDING");
            decimal unpaidFines = await _db.LibraryFines.Where(f => f.Status == "UNPAID").SumAsync(f => (decimal?)f.Amount) ?? 0.00m;

            return new LibraryStatsDTO
            {
                TotalTitles = totalBooks,
                TotalPhysicalCopies = totalCopies,
                AvailableCopies = availableCopies,
                IssuedCopies = issuedCopies,
                ActiveLoansCount = activeLoans,
                OverdueLoansCount = overdueLoans,
                PendingReservationsCount = pendingReservations,
                TotalUnpaidFines = unpaidFines
            };
        }

        // ==========================================
        // HELPER MAPPERS
        // ==========================================

        private BookDTO MapToBookDTO(Book book)
        {
            var copies = book.Copies?.ToList() ?? new List<BookCopy>();
            int total = copies.Count;
            int available = copies.Count(c => c.Status == "AVAILABLE");
            int issued = copies.Count(c => c.Status == "ISSUED");
            int reserved = copies.Count(c => c.Status == "RESERVED");

            return new BookDTO
            {
                BookId = book.BookId,
                Isbn = book.Isbn,
                Title = book.Title,
                Author = book.Author,
                Category = book.Category,
                Publisher = book.Publisher,
                PublicationYear = book.PublicationYear,
                Description = book.Description,
                CoverImageUrl = book.CoverImageUrl,
                CreatedAt = book.CreatedAt,
                TotalCopies = total,
                AvailableCopies = available,
                IssuedCopies = issued,
                ReservedCopies = reserved,
                Copies = copies.Select(c => MapToCopyDTO(c)).ToList()
            };
        }

        private BookCopyDTO MapToCopyDTO(BookCopy copy)
        {
            var activeLoan = copy.Loans?.FirstOrDefault(l => l.Status == "ACTIVE" || l.Status == "OVERDUE");

            return new BookCopyDTO
            {
                CopyId = copy.CopyId,
                BookId = copy.BookId,
                BookTitle = copy.Book?.Title ?? "",
                BookAuthor = copy.Book?.Author ?? "",
                AccessionNo = copy.AccessionNo,
                Status = copy.Status,
                RackLocation = copy.RackLocation,
                CreatedAt = copy.CreatedAt,
                CurrentLoanId = activeLoan?.LoanId,
                CurrentStudentId = activeLoan?.StudentId,
                DueDate = activeLoan?.DueAt
            };
        }

        private async Task<BookLoanDTO> GetLoanByIdAsync(long loanId)
        {
            var loan = await _db.BookLoans
                .Include(l => l.Copy)
                .ThenInclude(c => c!.Book)
                .Include(l => l.Fine)
                .FirstOrDefaultAsync(l => l.LoanId == loanId)
                ?? throw new KeyNotFoundException($"Loan #{loanId} not found.");

            var enriched = await EnrichLoansWithStudentNamesAsync(new List<BookLoan> { loan });
            return enriched[0];
        }

        private FineDTO MapToFineDTO(LibraryFine fine)
        {
            var loan = fine.Loan;
            var copy = loan?.Copy;
            var book = copy?.Book;

            return new FineDTO
            {
                FineId = fine.FineId,
                LoanId = fine.LoanId,
                StudentId = loan?.StudentId ?? 0,
                BookTitle = book?.Title ?? "Library Loan",
                AccessionNo = copy?.AccessionNo ?? "-",
                Amount = fine.Amount,
                Status = fine.Status,
                PaidAt = fine.PaidAt,
                FineReason = fine.FineReason,
                PaymentRef = fine.PaymentRef
            };
        }

        /// <summary>
        /// Reads student names from the shared students table in university_db.
        /// </summary>
        private async Task<List<BookLoanDTO>> EnrichLoansWithStudentNamesAsync(List<BookLoan> loans)
        {
            var studentIds = loans.Select(l => l.StudentId).Distinct().ToList();
            var studentMap = new Dictionary<long, (string Name, string Enrollment)>();

            if (studentIds.Any())
            {
                try
                {
                    using var command = _db.Database.GetDbConnection().CreateCommand();
                    string inClause = string.Join(",", studentIds);
                    command.CommandText = $"SELECT id, full_name, enrollment_no FROM students WHERE id IN ({inClause});";
                    await _db.Database.OpenConnectionAsync();

                    using var reader = await command.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        long id = reader.GetInt64(0);
                        string name = reader.IsDBNull(1) ? "Student #" + id : reader.GetString(1);
                        string enroll = reader.IsDBNull(2) ? "-" : reader.GetString(2);
                        studentMap[id] = (name, enroll);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Could not query student names: {Message}", ex.Message);
                }
            }

            var now = DateTime.UtcNow;
            return loans.Select(l =>
            {
                var book = l.Copy?.Book;
                string sName = studentMap.TryGetValue(l.StudentId, out var s) ? s.Name : $"Student #{l.StudentId}";
                string sEnroll = studentMap.TryGetValue(l.StudentId, out var se) ? se.Enrollment : "-";

                int overdueDays = 0;
                if (l.Status != "RETURNED" && now > l.DueAt)
                {
                    overdueDays = (int)Math.Ceiling((now - l.DueAt).TotalDays);
                }
                else if (l.ReturnedAt.HasValue && l.ReturnedAt.Value > l.DueAt)
                {
                    overdueDays = (int)Math.Ceiling((l.ReturnedAt.Value - l.DueAt).TotalDays);
                }

                return new BookLoanDTO
                {
                    LoanId = l.LoanId,
                    CopyId = l.CopyId,
                    AccessionNo = l.Copy?.AccessionNo ?? "-",
                    BookId = book?.BookId ?? 0,
                    BookTitle = book?.Title ?? "Unknown Title",
                    BookAuthor = book?.Author ?? "",
                    CoverImageUrl = book?.CoverImageUrl,
                    Category = book?.Category ?? "General",
                    StudentId = l.StudentId,
                    StudentName = sName,
                    EnrollmentNo = sEnroll,
                    IssuedAt = l.IssuedAt,
                    DueAt = l.DueAt,
                    ReturnedAt = l.ReturnedAt,
                    Status = (l.Status != "RETURNED" && overdueDays > 0) ? "OVERDUE" : l.Status,
                    OverdueDays = overdueDays,
                    FineAmount = l.Fine?.Amount ?? (overdueDays > 0 ? overdueDays * DAILY_FINE_RATE : 0.00m),
                    FineStatus = l.Fine?.Status,
                    Remarks = l.Remarks
                };
            }).ToList();
        }
    }
}
