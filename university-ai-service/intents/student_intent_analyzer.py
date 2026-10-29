"""
Intent Analyzer for the AI Student Assistant.
Classifies natural language student queries into actionable intents:
- Live authorized data intents (Attendance, Results, Timetable, Personal Fees, Library Loans)
- RAG knowledge intents (Policies, Syllabus, Notices, FAQs)
- LMS & Learning resource queries
- Escalations to faculty advisors or university support
"""

import re
import logging
from enum import Enum
from typing import Tuple

log = logging.getLogger(__name__)

class StudentIntent(str, Enum):
    ATTENDANCE = "ATTENDANCE"
    RESULTS = "RESULTS"
    TIMETABLE = "TIMETABLE"
    ASSIGNMENTS = "ASSIGNMENTS"
    FEES = "FEES"
    EXAMS = "EXAMS"
    PLACEMENTS = "PLACEMENTS"
    LIBRARY = "LIBRARY"
    POLICY = "POLICY"
    SYLLABUS = "SYLLABUS"
    ESCALATE = "ESCALATE"
    GENERAL = "GENERAL"

class StudentIntentAnalyzer:
    """Classifies user messages using rule-based pattern matching and keyword heuristics."""

    def __init__(self):
        # Patterns for escalation
        self.escalate_patterns = [
            r"\b(escalat|human|advisor|faculty advisor|speak to someone|talk to someone|connect me|complaint|grievance|ticket|support agent)\b",
            r"\b(dispute|dispute grade|need help from dean|head of dept|hod)\b"
        ]

        # Patterns for personal live attendance
        self.attendance_patterns = [
            r"\b(attendance|am i debarred|present count|attendance percentage|short of attendance|classes attended)\b",
            r"\b(how many classes|eligible for exams based on attendance)\b"
        ]

        # Patterns for personal live results / marks
        self.results_patterns = [
            r"\b(results?|grades?|marks?|gpa|cgpa|sgpa|scorecard|transcript|semester scores?|did i pass)\b"
        ]

        # Patterns for live timetable / lecture schedule
        self.timetable_patterns = [
            r"\b(timetable|class schedule|today'?s schedule|next lecture|which room|what time is class|routine)\b"
        ]

        # Patterns for assignments & LMS learning materials
        self.assignment_patterns = [
            r"\b(assignments?|homework|project deadlines?|submission dates?|explain assignment|study materials?|lecture notes?|learning resources?)\b"
        ]

        # Patterns for fees, invoices, and scholarships
        self.fees_patterns = [
            r"\b(fees?|tuition|invoices?|pending dues?|pay fee|fee structure|scholarships?|financial aid|concession|razorpay)\b"
        ]

        # Patterns for exams & hall tickets
        self.exam_patterns = [
            r"\b(exam schedule|mid-?terms?|semester end exams?|hall tickets?|admit cards?|seating arrangements?|exam dates?|exam timings?)\b"
        ]

        # Patterns for campus placement & career drives
        self.placement_patterns = [
            r"\b(placements?|job openings?|campus drives?|internships?|package lpa|interview rounds?|recruiters?|dream compan(y|ies)|applied jobs)\b"
        ]

        # Patterns for library books & loans
        self.library_patterns = [
            r"\b(library|borrow book|book copy|isbn|renew book|library fine|overdue fine|reserve book|book on shelf|clean code|clrs|korth)\b"
        ]

        # Patterns for general university policy
        self.policy_patterns = [
            r"\b(policy|regulations|rule|75% rule|condonation|minimum attendance rule|grading scale|plagiarism|dress code|leave policy)\b"
        ]

        # Patterns for course syllabus
        self.syllabus_patterns = [
            r"\b(syllabus|curriculum|course outline|topics covered|credits|reference book|prescribed book)\b"
        ]

    def analyze(self, message: str) -> Tuple[StudentIntent, float]:
        """
        Analyzes the incoming message and returns the most appropriate StudentIntent
        along with a confidence estimate (0.0 - 1.0).
        """
        if not message or not message.strip():
            return StudentIntent.GENERAL, 0.0

        text = message.lower().strip()

        # 1. Escalation check
        for pattern in self.escalate_patterns:
            if re.search(pattern, text):
                return StudentIntent.ESCALATE, 0.95

        # 2. Personal live data check (Attendance, Results, Timetable)
        for pattern in self.attendance_patterns:
            if re.search(pattern, text):
                # Distinguish general attendance policy from personal attendance check
                if "policy" in text or "rule" in text or "what is the minimum" in text:
                    return StudentIntent.POLICY, 0.85
                return StudentIntent.ATTENDANCE, 0.90

        for pattern in self.results_patterns:
            if re.search(pattern, text):
                return StudentIntent.RESULTS, 0.90

        for pattern in self.timetable_patterns:
            if re.search(pattern, text):
                return StudentIntent.TIMETABLE, 0.90

        # 3. Assignments & LMS
        for pattern in self.assignment_patterns:
            if re.search(pattern, text):
                return StudentIntent.ASSIGNMENTS, 0.88

        # 4. Library check
        for pattern in self.library_patterns:
            if re.search(pattern, text):
                return StudentIntent.LIBRARY, 0.88

        # 5. Fees & Scholarship
        for pattern in self.fees_patterns:
            if re.search(pattern, text):
                return StudentIntent.FEES, 0.88

        # 6. Placement & Career
        for pattern in self.placement_patterns:
            if re.search(pattern, text):
                return StudentIntent.PLACEMENTS, 0.88

        # 7. Exams & Hall Ticket
        for pattern in self.exam_patterns:
            if re.search(pattern, text):
                return StudentIntent.EXAMS, 0.88

        # 8. Syllabus
        for pattern in self.syllabus_patterns:
            if re.search(pattern, text):
                return StudentIntent.SYLLABUS, 0.88

        # 9. Policy
        for pattern in self.policy_patterns:
            if re.search(pattern, text):
                return StudentIntent.POLICY, 0.85

        return StudentIntent.GENERAL, 0.50
