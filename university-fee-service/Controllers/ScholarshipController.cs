using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UniversityFeeService.DTOs;
using UniversityFeeService.Services;

namespace UniversityFeeService.Controllers
{
    [ApiController]
    [Route("scholarship")]
    [Route("api/scholarship")]
    public class ScholarshipController : ControllerBase
    {
        private readonly IScholarshipService _scholarshipService;

        public ScholarshipController(IScholarshipService scholarshipService)
        {
            _scholarshipService = scholarshipService;
        }

        // GET: /scholarship
        [HttpGet]
        public async Task<IActionResult> GetAllScholarships()
        {
            var list = await _scholarshipService.GetAllScholarshipsAsync();
            return Ok(list);
        }

        // POST: /scholarship
        [HttpPost]
        public async Task<IActionResult> CreateScholarship([FromBody] ScholarshipReqDTO dto)
        {
            var created = await _scholarshipService.CreateScholarshipAsync(dto);
            return StatusCode(201, created);
        }

        // POST: /scholarship/award
        [HttpPost("award")]
        public async Task<IActionResult> AwardScholarship([FromBody] AwardScholarshipReqDTO dto)
        {
            var awarded = await _scholarshipService.AwardScholarshipAsync(dto);
            return StatusCode(201, awarded);
        }

        // GET: /scholarship/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentScholarships(long studentId)
        {
            var list = await _scholarshipService.GetStudentScholarshipsAsync(studentId);
            return Ok(list);
        }
    }
}
