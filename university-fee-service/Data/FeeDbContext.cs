using Microsoft.EntityFrameworkCore;
using UniversityFeeService.Models;

namespace UniversityFeeService.Data
{
    public class FeeDbContext : DbContext
    {
        public FeeDbContext(DbContextOptions<FeeDbContext> options) : base(options)
        {
        }

        public DbSet<FeeStructure> FeeStructures => Set<FeeStructure>();
        public DbSet<StudentInvoice> StudentInvoices => Set<StudentInvoice>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Scholarship> Scholarships => Set<Scholarship>();
        public DbSet<StudentScholarship> StudentScholarships => Set<StudentScholarship>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentScholarship>()
                .HasOne(s => s.Scholarship)
                .WithMany()
                .HasForeignKey(s => s.ScholarshipId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
