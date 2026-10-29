using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UniversityFeeService.Data;
using UniversityFeeService.DTOs;
using UniversityFeeService.Models;

namespace UniversityFeeService.Services
{
    public class FeeService : IFeeService
    {
        private readonly FeeDbContext _db;
        private readonly IRazorpayPaymentService _razorpayService;

        public FeeService(FeeDbContext db, IRazorpayPaymentService razorpayService)
        {
            _db = db;
            _razorpayService = razorpayService;
        }

        public async Task<FeeStructureRespDTO> CreateFeeStructureAsync(FeeStructureReqDTO dto)
        {
            var fee = new FeeStructure
            {
                DeptId = dto.DeptId,
                SemesterId = dto.SemesterId,
                FeeType = dto.FeeType,
                Amount = dto.Amount,
                AcademicYear = string.IsNullOrWhiteSpace(dto.AcademicYear) ? "2026-2027" : dto.AcademicYear
            };

            _db.FeeStructures.Add(fee);
            await _db.SaveChangesAsync();

            return MapToFeeDTO(fee);
        }

        public async Task<List<FeeStructureRespDTO>> GetFeeStructuresAsync(long? deptId, long? semesterId)
        {
            var query = _db.FeeStructures.AsQueryable();

            if (deptId.HasValue && deptId.Value > 0)
                query = query.Where(f => f.DeptId == deptId.Value);

            if (semesterId.HasValue && semesterId.Value > 0)
                query = query.Where(f => f.SemesterId == semesterId.Value);

            var list = await query.OrderByDescending(f => f.CreatedAt).ToListAsync();
            return list.Select(MapToFeeDTO).ToList();
        }

        public async Task DeleteFeeStructureAsync(long feeStructureId)
        {
            var fee = await _db.FeeStructures.FindAsync(feeStructureId);
            if (fee != null)
            {
                _db.FeeStructures.Remove(fee);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<InvoiceRespDTO> CreateInvoiceAsync(CreateInvoiceReqDTO dto)
        {
            // Check if student has active scholarship to deduct
            var activeScholarship = await _db.StudentScholarships
                .Include(s => s.Scholarship)
                .Where(s => s.StudentId == dto.StudentId && s.Status == "ACTIVE")
                .FirstOrDefaultAsync();

            decimal finalAmount = dto.TotalAmount;
            if (activeScholarship?.Scholarship != null)
            {
                finalAmount = Math.Max(0, finalAmount - activeScholarship.Scholarship.Amount);
            }

            var invoice = new StudentInvoice
            {
                StudentId = dto.StudentId,
                TotalAmount = finalAmount,
                PaidAmount = 0.00m,
                DueDate = dto.DueDate == default ? DateTime.UtcNow.AddMonths(1) : dto.DueDate,
                Status = "PENDING"
            };

            _db.StudentInvoices.Add(invoice);
            await _db.SaveChangesAsync();

            return MapToInvoiceDTO(invoice);
        }

        public async Task<List<InvoiceRespDTO>> GetInvoicesByStudentAsync(long studentId)
        {
            var invoices = await _db.StudentInvoices
                .Include(i => i.Payments)
                .Where(i => i.StudentId == studentId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return invoices.Select(MapToInvoiceDTO).ToList();
        }

        public async Task<List<InvoiceRespDTO>> GetAllInvoicesAsync()
        {
            var invoices = await _db.StudentInvoices
                .Include(i => i.Payments)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return invoices.Select(MapToInvoiceDTO).ToList();
        }

        public async Task<InvoiceRespDTO> GetInvoiceByIdAsync(long invoiceId)
        {
            var invoice = await _db.StudentInvoices
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
                throw new KeyNotFoundException($"Invoice not found with id {invoiceId}");

            return MapToInvoiceDTO(invoice);
        }

        public async Task<RazorpayOrderRespDTO> InitiatePaymentOrderAsync(CreateOrderReqDTO dto)
        {
            var invoice = await _db.StudentInvoices.FindAsync(dto.InvoiceId);
            if (invoice == null)
                throw new KeyNotFoundException($"Invoice #{dto.InvoiceId} not found");

            if (invoice.Status == "PAID")
                throw new InvalidOperationException($"Invoice #{dto.InvoiceId} is already fully paid.");

            decimal amountToPay = dto.CustomAmount.HasValue && dto.CustomAmount.Value > 0
                ? dto.CustomAmount.Value
                : (invoice.TotalAmount - invoice.PaidAmount);

            return await _razorpayService.CreateOrderAsync(dto.InvoiceId, amountToPay);
        }

        public async Task<PaymentRespDTO> VerifyAndRecordPaymentAsync(VerifyPaymentReqDTO dto)
        {
            var invoice = await _db.StudentInvoices.FindAsync(dto.InvoiceId);
            if (invoice == null)
                throw new KeyNotFoundException($"Invoice #{dto.InvoiceId} not found");

            // 1. Verify Razorpay cryptographic HMAC-SHA256 signature
            bool isSignatureValid = _razorpayService.VerifyPaymentSignature(
                dto.RazorpayOrderId,
                dto.RazorpayPaymentId,
                dto.RazorpaySignature
            );

            if (!isSignatureValid)
                throw new InvalidOperationException("Payment verification failed: Invalid Razorpay cryptographic signature.");

            // 2. Compute amount paid (default to remaining balance)
            decimal remainingBalance = invoice.TotalAmount - invoice.PaidAmount;
            decimal paidAmount = remainingBalance;

            // 3. Create payment transaction record (Never store card numbers/CVVs)
            var payment = new Payment
            {
                InvoiceId = invoice.InvoiceId,
                Amount = paidAmount,
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "RAZORPAY_TEST" : dto.PaymentMethod,
                TransactionRef = dto.RazorpayPaymentId,
                RazorpayOrderId = dto.RazorpayOrderId,
                RazorpaySignature = dto.RazorpaySignature,
                Status = "SUCCESS",
                PaidAt = DateTime.UtcNow
            };

            _db.Payments.Add(payment);

            // 4. Update invoice balances and status
            invoice.PaidAmount += paidAmount;
            if (invoice.PaidAmount >= invoice.TotalAmount)
            {
                invoice.Status = "PAID";
            }
            else
            {
                invoice.Status = "PARTIAL";
            }

            await _db.SaveChangesAsync();

            return MapToPaymentDTO(payment);
        }

        public async Task<List<PaymentRespDTO>> GetPaymentsByStudentAsync(long studentId)
        {
            var payments = await _db.Payments
                .Include(p => p.Invoice)
                .Where(p => p.Invoice != null && p.Invoice.StudentId == studentId)
                .OrderByDescending(p => p.PaidAt)
                .ToListAsync();

            return payments.Select(MapToPaymentDTO).ToList();
        }

        public async Task<PaymentRespDTO?> GetPaymentByIdAsync(long paymentId)
        {
            var payment = await _db.Payments
                .Include(p => p.Invoice)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            return payment != null ? MapToPaymentDTO(payment) : null;
        }

        private static FeeStructureRespDTO MapToFeeDTO(FeeStructure f) => new()
        {
            FeeStructureId = f.FeeStructureId,
            DeptId = f.DeptId,
            SemesterId = f.SemesterId,
            FeeType = f.FeeType,
            Amount = f.Amount,
            AcademicYear = f.AcademicYear
        };

        private static InvoiceRespDTO MapToInvoiceDTO(StudentInvoice i) => new()
        {
            InvoiceId = i.InvoiceId,
            StudentId = i.StudentId,
            TotalAmount = i.TotalAmount,
            PaidAmount = i.PaidAmount,
            DueDate = i.DueDate,
            Status = i.Status,
            CreatedAt = i.CreatedAt,
            Payments = i.Payments.Select(MapToPaymentDTO).ToList()
        };

        private static PaymentRespDTO MapToPaymentDTO(Payment p) => new()
        {
            PaymentId = p.PaymentId,
            InvoiceId = p.InvoiceId,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            TransactionRef = p.TransactionRef,
            Status = p.Status,
            PaidAt = p.PaidAt
        };
    }
}
