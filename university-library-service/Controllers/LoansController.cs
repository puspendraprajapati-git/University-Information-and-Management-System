using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Services;

namespace UniversityLibraryService.Controllers
{
    /// <summary>
    /// REST Controller handling book circulation, lending lifecycle, returns, and overdue tracking.
    /// Supports routing via direct /library/loans and API Gateway /api/library/loans.
    /// </summary>
    [ApiController]
    [Route("library/loans")]
    [Route("api/library/loans")]
    public class LoansController : ControllerBase
    {
        private readonly ILibraryService _libraryService;

        public LoansController(ILibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Issues an available physical copy to a student for a specified period (default 14 days).
        /// </summary>
        [HttpPost("issue")]
        public async Task<ActionResult<BookLoanDTO>> IssueBook([FromBody] IssueBookReqDTO dto)
        {
            try
            {
                var loan = await _libraryService.IssueBookAsync(dto);
                return StatusCode(201, loan);
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
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Returns a borrowed book, calculates late fines automatically if past due, and restocks the copy.
        /// </summary>
        [HttpPost("return")]
        public async Task<ActionResult<BookLoanDTO>> ReturnBook([FromBody] ReturnBookReqDTO dto)
        {
            try
            {
                var loan = await _libraryService.ReturnBookAsync(dto);
                return Ok(loan);
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
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves all book loans in the system, optionally filtered by status (ACTIVE, RETURNED, OVERDUE).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<BookLoanDTO>>> GetAllLoans([FromQuery] string? status = null)
        {
            var loans = await _libraryService.GetAllLoansAsync(status);
            return Ok(loans);
        }

        /// <summary>
        /// Retrieves active and historical borrowing records for a specific student.
        /// </summary>
        [HttpGet("student/{studentId:long}")]
        public async Task<ActionResult<List<BookLoanDTO>>> GetStudentLoans(
            long studentId,
            [FromQuery] bool? activeOnly = null)
        {
            var loans = await _libraryService.GetLoansByStudentAsync(studentId, activeOnly);
            return Ok(loans);
        }

        /// <summary>
        /// Lists all currently active loans that are overdue past their return deadline.
        /// </summary>
        [HttpGet("overdue")]
        public async Task<ActionResult<List<BookLoanDTO>>> GetOverdueLoans()
        {
            var loans = await _libraryService.GetOverdueLoansAsync();
            return Ok(loans);
        }

        /// <summary>
        /// Runs automated overdue reminder sweep across active loans and prepares student notices.
        /// </summary>
        [HttpPost("overdue/remind")]
        public async Task<IActionResult> SendOverdueReminders()
        {
            int count = await _libraryService.SendOverdueRemindersAsync();
            return Ok(new
            {
                message = $"Overdue sweep completed. {count} active loan(s) flagged for reminder notifications.",
                overdueCount = count,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
