using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityFeeService.DTOs;
using UniversityFeeService.Services;

namespace UniversityFeeService.Controllers
{
    [ApiController]
    [Route("payment")]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IFeeService _feeService;
        private readonly IRazorpayPaymentService _razorpayService;

        public PaymentController(IFeeService feeService, IRazorpayPaymentService razorpayService)
        {
            _feeService = feeService;
            _razorpayService = razorpayService;
        }

        // POST: /payment/create-order
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateRazorpayOrder([FromBody] CreateOrderReqDTO dto)
        {
            try
            {
                var order = await _feeService.InitiatePaymentOrderAsync(dto);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST: /payment/verify-payment
        // POST: /payment
        [HttpPost("verify-payment")]
        [HttpPost]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentReqDTO dto)
        {
            try
            {
                var receipt = await _feeService.VerifyAndRecordPaymentAsync(dto);
                return Ok(receipt);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Payment processing error", details = ex.Message });
            }
        }

        // GET: /payment/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetPaymentsByStudent(long studentId)
        {
            var list = await _feeService.GetPaymentsByStudentAsync(studentId);
            return Ok(list);
        }

        // GET: /payment/{id}
        // GET: /payment/receipt/{id}
        [HttpGet("{id}")]
        [HttpGet("receipt/{id}")]
        public async Task<IActionResult> GetPaymentReceipt(long id)
        {
            var payment = await _feeService.GetPaymentByIdAsync(id);
            if (payment == null)
                return NotFound(new { error = $"Payment #{id} not found" });

            return Ok(payment);
        }
    }
}
