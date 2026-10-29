using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Services;

namespace UniversityLibraryService.Controllers
{
    /// <summary>
    /// REST Controller for managing book catalog titles and physical copies inventory.
    /// Supports routing via direct /library/books and API Gateway /api/library/books.
    /// </summary>
    [ApiController]
    [Route("library/books")]
    [Route("api/library/books")]
    public class BooksController : ControllerBase
    {
        private readonly ILibraryService _libraryService;

        public BooksController(ILibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Retrieves all book titles matching optional search and category filters.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<BookDTO>>> GetAllBooks(
            [FromQuery] string? search = null,
            [FromQuery] string? category = null)
        {
            var books = await _libraryService.GetAllBooksAsync(search, category);
            return Ok(books);
        }

        /// <summary>
        /// Retrieves full details and physical copies for a single book title.
        /// </summary>
        [HttpGet("{id:long}")]
        public async Task<ActionResult<BookDTO>> GetBookById(long id)
        {
            var book = await _libraryService.GetBookByIdAsync(id);
            if (book == null) return NotFound(new { error = $"Book title #{id} not found." });
            return Ok(book);
        }

        /// <summary>
        /// Adds a new book to the university catalog and automatically provisions initial physical copies.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<BookDTO>> CreateBook([FromBody] BookCreateDTO dto)
        {
            try
            {
                var book = await _libraryService.CreateBookAsync(dto);
                return CreatedAtAction(nameof(GetBookById), new { id = book.BookId }, book);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Updates catalog metadata (Title, Author, Category, Description) for a book.
        /// </summary>
        [HttpPut("{id:long}")]
        public async Task<ActionResult<BookDTO>> UpdateBook(long id, [FromBody] BookCreateDTO dto)
        {
            var updated = await _libraryService.UpdateBookAsync(id, dto);
            if (updated == null) return NotFound(new { error = $"Book #{id} not found." });
            return Ok(updated);
        }

        /// <summary>
        /// Deletes a book and all associated copies.
        /// </summary>
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteBook(long id)
        {
            bool deleted = await _libraryService.DeleteBookAsync(id);
            if (!deleted) return NotFound(new { error = $"Book #{id} not found." });
            return NoContent();
        }

        /// <summary>
        /// Returns all unique book subject categories for dropdown filters.
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<List<string>>> GetCategories()
        {
            var categories = await _libraryService.GetCategoriesAsync();
            return Ok(categories);
        }

        // ==========================================
        // PHYSICAL COPIES SUB-ROUTES
        // ==========================================

        /// <summary>
        /// Lists all physical copies (accession numbers, shelf locations, status) for a book.
        /// </summary>
        [HttpGet("{id:long}/copies")]
        public async Task<ActionResult<List<BookCopyDTO>>> GetCopiesByBookId(long id)
        {
            var copies = await _libraryService.GetCopiesByBookIdAsync(id);
            return Ok(copies);
        }

        /// <summary>
        /// Adds a new physical copy to an existing book title.
        /// </summary>
        [HttpPost("copies")]
        public async Task<ActionResult<BookCopyDTO>> AddCopy([FromBody] BookCopyCreateDTO dto)
        {
            try
            {
                var copy = await _libraryService.AddBookCopyAsync(dto);
                return StatusCode(201, copy);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Modifies the status (AVAILABLE, MAINTENANCE, LOST) or rack location of a copy.
        /// </summary>
        [HttpPut("copies/{copyId:long}/status")]
        public async Task<IActionResult> UpdateCopyStatus(
            long copyId,
            [FromBody] UpdateCopyStatusReq req)
        {
            bool ok = await _libraryService.UpdateCopyStatusAsync(copyId, req.Status, req.RackLocation);
            if (!ok) return NotFound(new { error = $"Copy #{copyId} not found." });
            return Ok(new { message = $"Copy #{copyId} status updated to {req.Status}." });
        }

        /// <summary>
        /// Removes a physical copy from the library.
        /// </summary>
        [HttpDelete("copies/{copyId:long}")]
        public async Task<IActionResult> DeleteCopy(long copyId)
        {
            try
            {
                bool ok = await _libraryService.DeleteBookCopyAsync(copyId);
                if (!ok) return NotFound(new { error = $"Copy #{copyId} not found." });
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class UpdateCopyStatusReq
    {
        public string Status { get; set; } = "AVAILABLE";
        public string? RackLocation { get; set; }
    }
}
