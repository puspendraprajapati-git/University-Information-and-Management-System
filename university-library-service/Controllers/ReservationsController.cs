using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Services;

namespace UniversityLibraryService.Controllers
{
    /// <summary>
    /// REST Controller for placing and managing student book reservations (holds).
    /// </summary>
    [ApiController]
    [Route("library/reservations")]
    [Route("api/library/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly ILibraryService _libraryService;

        public ReservationsController(ILibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Gets all library book reservations, optionally filtered by status (PENDING, FULFILLED, CANCELLED).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ReservationDTO>>> GetAllReservations([FromQuery] string? status = null)
        {
            var list = await _libraryService.GetAllReservationsAsync(status);
            return Ok(list);
        }

        /// <summary>
        /// Places a reservation hold on a book title when copies are checked out.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ReservationDTO>> CreateReservation([FromBody] ReservationReqDTO dto)
        {
            try
            {
                var reservation = await _libraryService.CreateReservationAsync(dto);
                return StatusCode(201, reservation);
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
        /// Gets all active and fulfilled reservations for a student.
        /// </summary>
        [HttpGet("student/{studentId:long}")]
        public async Task<ActionResult<List<ReservationDTO>>> GetStudentReservations(long studentId)
        {
            var list = await _libraryService.GetReservationsByStudentAsync(studentId);
            return Ok(list);
        }

        /// <summary>
        /// Gets the reservation waiting queue for a specific book title.
        /// </summary>
        [HttpGet("book/{bookId:long}")]
        public async Task<ActionResult<List<ReservationDTO>>> GetBookReservations(long bookId)
        {
            var list = await _libraryService.GetReservationsByBookAsync(bookId);
            return Ok(list);
        }

        /// <summary>
        /// Cancels a pending book reservation hold.
        /// </summary>
        [HttpDelete("{id:long}")]
        [HttpPost("{id:long}/cancel")]
        public async Task<IActionResult> CancelReservation(long id)
        {
            bool ok = await _libraryService.CancelReservationAsync(id);
            if (!ok) return NotFound(new { error = $"Reservation #{id} not found." });
            return NoContent();
        }

        /// <summary>
        /// Fulfills a reservation hold by assigning a returned or available copy.
        /// </summary>
        [HttpPost("{id:long}/fulfill")]
        public async Task<IActionResult> FulfillReservation(long id, [FromQuery] long? copyId = null)
        {
            bool ok = await _libraryService.FulfillReservationAsync(id, copyId);
            if (!ok) return NotFound(new { error = $"Reservation #{id} not found." });
            return Ok(new { message = $"Reservation #{id} fulfilled successfully." });
        }
    }
}
