using System.Threading.Tasks;
using UniversityFeeService.DTOs;

namespace UniversityFeeService.Services
{
    public interface IRazorpayPaymentService
    {
        Task<RazorpayOrderRespDTO> CreateOrderAsync(long invoiceId, decimal amount);
        bool VerifyPaymentSignature(string orderId, string paymentId, string signature);
        string GetKeyId();
    }
}
