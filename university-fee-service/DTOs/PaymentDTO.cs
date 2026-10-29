using System;

namespace UniversityFeeService.DTOs
{
    public class CreateOrderReqDTO
    {
        public long InvoiceId { get; set; }
        public decimal? CustomAmount { get; set; } // If null, pays entire remaining balance
    }

    public class RazorpayOrderRespDTO
    {
        public string OrderId { get; set; } = string.Empty;
        public long AmountInPaise { get; set; }
        public decimal AmountInRupees { get; set; }
        public string Currency { get; set; } = "INR";
        public string KeyId { get; set; } = string.Empty;
        public long InvoiceId { get; set; }
        public string BusinessName { get; set; } = "EduCore University";
        public string Description { get; set; } = "Semester Tuition & College Fees";
    }

    public class VerifyPaymentReqDTO
    {
        public long InvoiceId { get; set; }
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; } // e.g. "UPI", "CARD", "NETBANKING"
    }

    public class PaymentRespDTO
    {
        public long PaymentId { get; set; }
        public long InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionRef { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
        public string ReceiptNumber => $"RCP-{InvoiceId}-{PaymentId}-{PaidAt:yyyyMMdd}";
    }
}
