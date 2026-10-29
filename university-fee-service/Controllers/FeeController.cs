using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityFeeService.DTOs;
using UniversityFeeService.Services;

namespace UniversityFeeService.Controllers
{
    [ApiController]
    [Route("fee")]
    [Route("api/fee")]
    public class FeeController : ControllerBase
    {
        private readonly IFeeService _feeService;

        public FeeController(IFeeService feeService)
        {
            _feeService = feeService;
        }

        // GET: /fee
        [HttpGet]
        public async Task<IActionResult> GetFeeStructures([FromQuery] long? deptId, [FromQuery] long? semesterId)
        {
            var list = await _feeService.GetFeeStructuresAsync(deptId, semesterId);
            return Ok(list);
        }

        // POST: /fee
        [HttpPost]
        public async Task<IActionResult> CreateFeeStructure([FromBody] FeeStructureReqDTO dto)
        {
            var created = await _feeService.CreateFeeStructureAsync(dto);
            return StatusCode(201, created);
        }

        // DELETE: /fee/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeeStructure(long id)
        {
            await _feeService.DeleteFeeStructureAsync(id);
            return NoContent();
        }

        // GET: /fee/invoices
        [HttpGet("invoices")]
        public async Task<IActionResult> GetAllInvoices()
        {
            var list = await _feeService.GetAllInvoicesAsync();
            return Ok(list);
        }

        // POST: /fee/invoices
        [HttpPost("invoices")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceReqDTO dto)
        {
            var invoice = await _feeService.CreateInvoiceAsync(dto);
            return StatusCode(201, invoice);
        }

        // GET: /fee/invoices/student/{studentId}
        // GET: /fee/student/{studentId} (supports existing frontend call)
        [HttpGet("invoices/student/{studentId}")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentInvoices(long studentId)
        {
            var invoices = await _feeService.GetInvoicesByStudentAsync(studentId);
            return Ok(invoices);
        }

        // GET: /fee/invoices/{id}
        // GET: /fee/{id}
        [HttpGet("invoices/{id}")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(long id)
        {
            try
            {
                var invoice = await _feeService.GetInvoiceByIdAsync(id);
                return Ok(invoice);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Invoice #{id} not found" });
            }
        }
    }
}
