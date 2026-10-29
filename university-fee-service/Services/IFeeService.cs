using System.Collections.Generic;
using System.Threading.Tasks;
using UniversityFeeService.DTOs;

namespace UniversityFeeService.Services
{
    public interface IFeeService
    {
        Task<FeeStructureRespDTO> CreateFeeStructureAsync(FeeStructureReqDTO dto);
        Task<List<FeeStructureRespDTO>> GetFeeStructuresAsync(long? deptId, long? semesterId);
        Task DeleteFeeStructureAsync(long feeStructureId);

        Task<InvoiceRespDTO> CreateInvoiceAsync(CreateInvoiceReqDTO dto);
        Task<List<InvoiceRespDTO>> GetInvoicesByStudentAsync(long studentId);
        Task<List<InvoiceRespDTO>> GetAllInvoicesAsync();
        Task<InvoiceRespDTO> GetInvoiceByIdAsync(long invoiceId);

        Task<RazorpayOrderRespDTO> InitiatePaymentOrderAsync(CreateOrderReqDTO dto);
        Task<PaymentRespDTO> VerifyAndRecordPaymentAsync(VerifyPaymentReqDTO dto);
        Task<List<PaymentRespDTO>> GetPaymentsByStudentAsync(long studentId);
        Task<PaymentRespDTO?> GetPaymentByIdAsync(long paymentId);
    }
}
