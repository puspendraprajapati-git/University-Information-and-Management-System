using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Services;

namespace UniversityLibraryService.Controllers
{
    /// <summary>
    /// REST Controller for overdue fines audit, settlement, and waiver.
    /// </summary>
    [ApiController]
    [Route("library/fines")]
    [Route("api/library/fines")]
    public class FinesController : ControllerBase
    {
        private readonly ILibraryService _libraryService;

        public FinesController(ILibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Retrieves all disciplinary library fines with optional status filter (UNPAID, PAID, WAIVED).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<FineDTO>>> GetAllFines([FromQuery] string? status = null)
        {
            var fines = await _libraryService.GetAllFinesAsync(status);
            return Ok(fines);
        }

        /// <summary>
        /// Retrieves fine charges associated with a specific student.
        /// </summary>
        [HttpGet("student/{studentId:long}")]
        public async Task<ActionResult<List<FineDTO>>> GetStudentFines(long studentId)
        {
            var fines = await _libraryService.GetFinesByStudentAsync(studentId);
            return Ok(fines);
        }

        /// <summary>
        /// Settles an unpaid fine with payment confirmation reference.
        /// </summary>
        [HttpPost("{id:long}/pay")]
        public async Task<ActionResult<FineDTO>> PayFine(long id, [FromBody] PayFineReq? req)
        {
            try
            {
                var fine = await _libraryService.PayFineAsync(id, req?.PaymentRef);
                return Ok(fine);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Waives a fine due to documented medical or administrative reasons.
        /// </summary>
        [HttpPost("{id:long}/waive")]
        public async Task<ActionResult<FineDTO>> WaiveFine(long id, [FromBody] WaiveFineReq req)
        {
            try
            {
                var fine = await _libraryService.WaiveFineAsync(id, req.Reason);
                return Ok(fine);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }

    public class PayFineReq
    {
        public string? PaymentRef { get; set; }
    }

    public class WaiveFineReq
    {
        public string Reason { get; set; } = "Administrative waiver";
    }
}
