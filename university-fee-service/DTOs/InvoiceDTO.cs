using System;
using System.Collections.Generic;

namespace UniversityFeeService.DTOs
{
    public class CreateInvoiceReqDTO
    {
        public long StudentId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class InvoiceRespDTO
    {
        public long InvoiceId { get; set; }
        public long StudentId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal OutstandingBalance => TotalAmount - PaidAmount;
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<PaymentRespDTO> Payments { get; set; } = new();
    }
}
