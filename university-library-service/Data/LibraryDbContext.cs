using Microsoft.EntityFrameworkCore;
using UniversityLibraryService.Models;

namespace UniversityLibraryService.Data
{
    /// <summary>
    /// Entity Framework Core Database Context for University Library & Resource Management.
    /// Connects to the centralized MySQL university_db database.
    /// </summary>
    public class LibraryDbContext : DbContext
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<BookCopy> BookCopies { get; set; } = null!;
        public DbSet<BookLoan> BookLoans { get; set; } = null!;
        public DbSet<LibraryReservation> LibraryReservations { get; set; } = null!;
        public DbSet<LibraryFine> LibraryFines { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Book entity
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.BookId);
                entity.HasIndex(e => e.Isbn);
                entity.HasIndex(e => e.Category);
            });

            // Configure BookCopy entity: unique accession number per copy
            modelBuilder.Entity<BookCopy>(entity =>
            {
                entity.HasKey(e => e.CopyId);
                entity.HasIndex(e => e.AccessionNo).IsUnique();
                entity.HasOne(e => e.Book)
                      .WithMany(b => b.Copies)
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure BookLoan entity
            modelBuilder.Entity<BookLoan>(entity =>
            {
                entity.HasKey(e => e.LoanId);
                entity.HasIndex(e => e.StudentId);
                entity.HasIndex(e => e.Status);
                entity.HasOne(e => e.Copy)
                      .WithMany(c => c.Loans)
                      .HasForeignKey(e => e.CopyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure LibraryReservation entity
            modelBuilder.Entity<LibraryReservation>(entity =>
            {
                entity.HasKey(e => e.ReservationId);
                entity.HasIndex(e => e.StudentId);
                entity.HasIndex(e => e.Status);
                entity.HasOne(e => e.Book)
                      .WithMany(b => b.Reservations)
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure LibraryFine entity
            modelBuilder.Entity<LibraryFine>(entity =>
            {
                entity.HasKey(e => e.FineId);
                entity.HasIndex(e => e.Status);
                entity.HasOne(e => e.Loan)
                      .WithOne(l => l.Fine)
                      .HasForeignKey<LibraryFine>(e => e.LoanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
