using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityLibraryService.DTOs;
using UniversityLibraryService.Services;

namespace UniversityLibraryService.Controllers
{
    /// <summary>
    /// REST Controller providing global library health checks and operational KPI metrics.
    /// </summary>
    [ApiController]
    [Route("library")]
    [Route("api/library")]
    public class LibraryStatsController : ControllerBase
    {
        private readonly ILibraryService _libraryService;

        public LibraryStatsController(ILibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Global service health check for API Gateway and monitoring.
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                service = "university-library-service",
                framework = "ASP.NET Core Web API (.NET 10.0)",
                status = "UP",
                port = 5300,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Retrieves real-time executive statistics on library catalog holdings, circulation, and fines.
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<LibraryStatsDTO>> GetStats()
        {
            var stats = await _libraryService.GetLibraryStatsAsync();
            return Ok(stats);
        }
    }
}
