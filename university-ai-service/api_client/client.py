import requests
import logging
from typing import Optional
from config.settings import API_GATEWAY_URL

logger = logging.getLogger(__name__)

class ApiClient:
    def __init__(self, token: str):
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"} if token else {}
        self.base_url = API_GATEWAY_URL

    def _get(self, endpoint: str) -> Optional[dict]:
        try:
            url = f"{self.base_url}{endpoint}"
            res = requests.get(url, headers=self.headers, timeout=10)
            if res.status_code == 200:
                return res.json()
            elif res.status_code in (401, 403):
                return {"error": "Authentication required. Please log in."}
            else:
                logger.error(f"API Error ({res.status_code}) for {url}: {res.text}")
                return {"error": f"Failed to fetch data. Status: {res.status_code}"}
        except Exception as e:
            logger.error(f"API Exception for {endpoint}: {e}")
            return {"error": "An internal error occurred."}

    def get_student_profile(self, user_id: int) -> dict:
        return self._get(f"/students/user/{user_id}")
        
    def get_faculty_profile(self, user_id: int) -> dict:
        return self._get(f"/faculty/user/{user_id}")

    def get_attendance(self, student_id: int) -> dict:
        return self._get(f"/attendance/student/{student_id}")

    def get_results(self, student_id: int) -> dict:
        return self._get(f"/results/student/{student_id}")

    def get_events(self) -> dict:
        return self._get("/events")

    def get_subjects(self) -> dict:
        return self._get("/subjects")
        
    def get_departments(self) -> dict:
        return self._get("/departments")
        
    def get_semesters(self) -> dict:
        return self._get("/semesters")
