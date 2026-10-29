using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityFeeService.Models
{
    [Table("student_invoices")]
    public class StudentInvoice
    {
        [Key]
        [Column("invoice_id")]
        public long InvoiceId { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column("paid_amount", TypeName = "decimal(10,2)")]
        public decimal PaidAmount { get; set; } = 0.00m;

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "PENDING"; // PENDING, PAID, PARTIAL, OVERDUE

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
