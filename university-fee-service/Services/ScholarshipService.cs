using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UniversityFeeService.Data;
using UniversityFeeService.DTOs;
using UniversityFeeService.Models;

namespace UniversityFeeService.Services
{
    public interface IScholarshipService
    {
        Task<Scholarship> CreateScholarshipAsync(ScholarshipReqDTO dto);
        Task<List<Scholarship>> GetAllScholarshipsAsync();
        Task<StudentScholarshipRespDTO> AwardScholarshipAsync(AwardScholarshipReqDTO dto);
        Task<List<StudentScholarshipRespDTO>> GetStudentScholarshipsAsync(long studentId);
    }

    public class ScholarshipService : IScholarshipService
    {
        private readonly FeeDbContext _db;

        public ScholarshipService(FeeDbContext db)
        {
            _db = db;
        }

        public async Task<Scholarship> CreateScholarshipAsync(ScholarshipReqDTO dto)
        {
            var scholarship = new Scholarship
            {
                Name = dto.Name,
                EligibilityCriteria = dto.EligibilityCriteria,
                Amount = dto.Amount
            };

            _db.Scholarships.Add(scholarship);
            await _db.SaveChangesAsync();
            return scholarship;
        }

        public async Task<List<Scholarship>> GetAllScholarshipsAsync()
        {
            return await _db.Scholarships.ToListAsync();
        }

        public async Task<StudentScholarshipRespDTO> AwardScholarshipAsync(AwardScholarshipReqDTO dto)
        {
            var sch = await _db.Scholarships.FindAsync(dto.ScholarshipId);
            if (sch == null)
                throw new KeyNotFoundException($"Scholarship #{dto.ScholarshipId} not found");

            var award = new StudentScholarship
            {
                StudentId = dto.StudentId,
                ScholarshipId = dto.ScholarshipId,
                AwardedAt = System.DateTime.UtcNow,
                Status = "ACTIVE"
            };

            _db.StudentScholarships.Add(award);
            await _db.SaveChangesAsync();

            return new StudentScholarshipRespDTO
            {
                Id = award.Id,
                StudentId = award.StudentId,
                ScholarshipId = award.ScholarshipId,
                ScholarshipName = sch.Name,
                Amount = sch.Amount,
                AwardedAt = award.AwardedAt,
                Status = award.Status
            };
        }

        public async Task<List<StudentScholarshipRespDTO>> GetStudentScholarshipsAsync(long studentId)
        {
            var list = await _db.StudentScholarships
                .Include(s => s.Scholarship)
                .Where(s => s.StudentId == studentId)
                .ToListAsync();

            return list.Select(s => new StudentScholarshipRespDTO
            {
                Id = s.Id,
                StudentId = s.StudentId,
                ScholarshipId = s.ScholarshipId,
                ScholarshipName = s.Scholarship?.Name ?? "Scholarship",
                Amount = s.Scholarship?.Amount ?? 0,
                AwardedAt = s.AwardedAt,
                Status = s.Status
            }).ToList();
        }
    }
}
