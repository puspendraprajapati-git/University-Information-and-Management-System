"""
Authorized Student Data API Client.
Enforces strict security by dispatching all student data requests through the
Java Spring Boot / API Gateway backend using the user's verified JWT Bearer token.
Never queries private student records directly from DB without authorized backend validation.
"""

import requests
import logging
from typing import Optional, Dict, Any, List
from config.settings import GATEWAY_URL

log = logging.getLogger(__name__)

class StudentApiClient:
    def __init__(self, token: Optional[str] = None):
        self.raw_token = token
        if token and token.startswith("Bearer "):
            self.clean_token = token[7:]
        else:
            self.clean_token = token

        self.headers = {"Authorization": f"Bearer {self.clean_token}"} if self.clean_token else {}
        self.gateway_url = GATEWAY_URL.rstrip("/")

    def _get(self, path: str) -> Optional[Any]:
        """Performs an authorized GET request through the API Gateway."""
        if not self.clean_token:
            return {"error": "AUTH_REQUIRED", "message": "Authentication token missing."}

        url = f"{self.gateway_url}{path}"
        try:
            res = requests.get(url, headers=self.headers, timeout=8)
            if res.status_code == 200:
                return res.json()
            elif res.status_code in (401, 403):
                log.warning(f"Unauthorized request ({res.status_code}) to {url}")
                return {"error": "UNAUTHORIZED", "message": "Your session has expired or you do not have permission to access these records."}
            elif res.status_code == 404:
                return {"error": "NOT_FOUND", "message": "Record not found."}
            else:
                log.error(f"Backend API error ({res.status_code}) at {url}: {res.text}")
                return {"error": "API_ERROR", "status_code": res.status_code}
        except requests.exceptions.RequestException as e:
            log.error(f"Network exception requesting {url}: {e}")
            return {"error": "NETWORK_ERROR", "message": "Could not connect to university backend."}

    # ==========================================
    # 1. Profile Verification (Spring Boot Core)
    # ==========================================

    def get_verified_student_profile(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieves the authenticated student's profile via Spring Boot.
        Verifies ownership against the JWT token.
        """
        data = self._get(f"/api/students/user/{user_id}")
        if isinstance(data, dict) and "error" not in data:
            return data
        return None

    # ==========================================
    # 2. Live Attendance (Spring Boot Core)
    # ==========================================

    def get_live_attendance(self, student_id: int) -> Dict[str, Any]:
        """
        Fetches live attendance records verified by Spring Boot.
        Calculates aggregate statistics and subject breakdown.
        """
        records = self._get(f"/api/attendance/student/{student_id}")
        if isinstance(records, dict) and "error" in records:
            return records

        if not isinstance(records, list):
            return {"total_classes": 0, "present_classes": 0, "percentage": 0.0, "records": []}

        total = len(records)
        present = sum(1 for r in records if r.get("status") in ("PRESENT", "Present", "P"))
        pct = round((present / total * 100), 1) if total > 0 else 0.0

        # Group by subject
        subjects_map = {}
        for r in records:
            sub = r.get("subject", {})
            sub_name = sub.get("subjectName") or sub.get("name") or "Subject"
            if sub_name not in subjects_map:
                subjects_map[sub_name] = {"total": 0, "present": 0}
            subjects_map[sub_name]["total"] += 1
            if r.get("status") in ("PRESENT", "Present", "P"):
                subjects_map[sub_name]["present"] += 1

        subject_summary = []
        for s_name, counts in subjects_map.items():
            s_pct = round((counts["present"] / counts["total"] * 100), 1) if counts["total"] > 0 else 0.0
            subject_summary.append({
                "subject": s_name,
                "present": counts["present"],
                "total": counts["total"],
                "percentage": s_pct,
                "is_low": s_pct < 75.0
            })

        return {
            "total_classes": total,
            "present_classes": present,
            "absent_classes": total - present,
            "overall_percentage": pct,
            "is_below_75": pct < 75.0,
            "subjects": subject_summary
        }

    # ==========================================
    # 3. Live Academic Results (Spring Boot Core)
    # ==========================================

    def get_live_results(self, student_id: int) -> Dict[str, Any]:
        """Fetches live examination results and calculated SGPA/CGPA."""
        data = self._get(f"/api/results/student/{student_id}")
        if isinstance(data, dict) and "error" in data:
            return data

        results_list = data if isinstance(data, list) else []
        return {
            "total_results": len(results_list),
            "results": results_list
        }

    # ==========================================
    # 4. Live Timetable & Schedule (Exam Service)
    # ==========================================

    def get_live_timetable(self, semester_id: Optional[int] = None, dept_id: Optional[int] = None) -> Dict[str, Any]:
        """Fetches active timetable slots and lecture rooms."""
        path = "/timetable"
        if semester_id:
            path = f"/timetable/semester/{semester_id}"
        data = self._get(path)
        if isinstance(data, dict) and "error" in data:
            return data

        slots = data if isinstance(data, list) else []
        return {"slots": slots}

    # ==========================================
    # 5. Course Assignments & LMS (LMS Service)
    # ==========================================

    def get_lms_assignments(self) -> Dict[str, Any]:
        """Fetches active coursework assignments from the LMS microservice."""
        data = self._get("/lms/assignments")
        if isinstance(data, dict) and "error" in data:
            return data
        assignments = data if isinstance(data, list) else []
        return {"assignments": assignments}

    def get_lms_resources(self) -> Dict[str, Any]:
        """Fetches available study resources and reference files."""
        data = self._get("/lms/resources")
        if isinstance(data, dict) and "error" in data:
            return data
        resources = data if isinstance(data, list) else []
        return {"resources": resources}

    # ==========================================
    # 6. Fees & Invoices (Fee Service Port 5100)
    # ==========================================

    def get_student_fees(self, student_id: int) -> Dict[str, Any]:
        """Fetches tuition invoices and outstanding balances from the ASP.NET Core Fee Service."""
        data = self._get(f"/fee/student/{student_id}")
        if isinstance(data, dict) and "error" in data:
            return data
        invoices = data if isinstance(data, list) else []
        pending = sum(float(inv.get("totalAmount") or inv.get("amount") or 0) for inv in invoices if inv.get("status") in ("PENDING", "UNPAID"))
        return {
            "invoices": invoices,
            "pending_amount": pending,
            "has_pending_dues": pending > 0
        }

    # ==========================================
    # 7. Library Circulation (Port 5300)
    # ==========================================

    def get_library_status(self, student_id: int) -> Dict[str, Any]:
        """Fetches student's borrowed books, due dates, fines, and reservations."""
        loans = self._get(f"/library/loans/student/{student_id}")
        fines = self._get(f"/library/fines/student/{student_id}")
        holds = self._get(f"/library/reservations/student/{student_id}")

        loans_list = loans if isinstance(loans, list) else []
        fines_list = fines if isinstance(fines, list) else []
        holds_list = holds if isinstance(holds, list) else []

        active_loans = [l for l in loans_list if l.get("status") == "ACTIVE"]
        overdue_loans = [l for l in loans_list if l.get("isOverdue") or l.get("status") == "OVERDUE"]
        unpaid_fines = sum(float(f.get("amount") or 0) for f in fines_list if f.get("status") == "UNPAID")

        return {
            "active_loans": active_loans,
            "overdue_loans": overdue_loans,
            "unpaid_fines": unpaid_fines,
            "reservations": holds_list
        }

    # ==========================================
    # 8. Placements & Campus Drives (Port 8084)
    # ==========================================

    def get_placement_opportunities(self, student_id: Optional[int] = None) -> Dict[str, Any]:
        """Fetches campus job openings, upcoming drives, and personal applications."""
        jobs = self._get("/placement/jobs")
        drives = self._get("/placement/drives/upcoming")
        apps = self._get(f"/placement/student/{student_id}/applications") if student_id else []

        return {
            "openings": jobs if isinstance(jobs, list) else [],
            "drives": drives if isinstance(drives, list) else [],
            "applications": apps if isinstance(apps, list) else []
        }
