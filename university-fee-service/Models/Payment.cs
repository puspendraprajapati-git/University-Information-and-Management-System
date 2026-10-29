using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityFeeService.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("payment_id")]
        public long PaymentId { get; set; }

        [Column("invoice_id")]
        public long InvoiceId { get; set; }

        [Column("amount", TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "RAZORPAY"; // RAZORPAY_UPI, RAZORPAY_CARD, RAZORPAY_NETBANKING

        [Required]
        [MaxLength(255)]
        [Column("transaction_ref")]
        public string TransactionRef { get; set; } = string.Empty; // Razorpay payment ID (e.g. pay_xxxxx)

        [MaxLength(255)]
        [Column("razorpay_order_id")]
        public string RazorpayOrderId { get; set; } = string.Empty; // order_xxxxx

        [MaxLength(500)]
        [Column("razorpay_signature")]
        public string? RazorpaySignature { get; set; }

        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "SUCCESS"; // SUCCESS, FAILED, PENDING

        [Column("paid_at")]
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("InvoiceId")]
        public virtual StudentInvoice? Invoice { get; set; }
    }
}
