"""
Knowledge Document Seeder for University AI Assistant.
Seeds foundational university policies, syllabus, library regulations,
and official campus notices into MySQL (knowledge_documents, document_chunks)
and indexes them into the dedicated vector store.
"""

import logging
from config.database import count_knowledge_documents, save_knowledge_document, save_document_chunks, get_all_chunks
from services.vector_store import DedicatedVectorStore

log = logging.getLogger(__name__)

DEFAULT_DOCUMENTS = [
    {
        "title": "University Academic Regulations & Attendance Policy 2026",
        "document_type": "POLICY",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "University Academic Attendance Policy 2026:\n"
                    "1. Minimum Attendance Requirement: All registered undergraduate and postgraduate students "
                    "must maintain a minimum of 75% aggregate attendance in lectures and laboratory sessions "
                    "for each enrolled subject to be eligible to sit for the semester-end examinations.\n"
                    "2. Medical Condonation: Students with attendance between 65% and 74.9% may apply for medical "
                    "condonation by submitting verified hospital records to the Dean of Academic Affairs within 7 days of absence.\n"
                    "3. Debarment: Students having less than 65% attendance will be detained and marked 'Not Eligible' (NE) "
                    "for that semester and must re-register for the course in subsequent terms."
                )
            },
            {
                "page": 2,
                "text": (
                    "Grading Scale and Evaluation Standards:\n"
                    "The university follows a 10-point Cumulative Grade Point Average (CGPA) credit system:\n"
                    "- Outstanding (O): 90% - 100% (Grade Point 10.0)\n"
                    "- Excellent (A+): 80% - 89% (Grade Point 9.0)\n"
                    "- Very Good (A): 70% - 79% (Grade Point 8.0)\n"
                    "- Good (B+): 60% - 69% (Grade Point 7.0)\n"
                    "- Above Average (B): 50% - 59% (Grade Point 6.0)\n"
                    "- Pass (C): 40% - 49% (Grade Point 5.0)\n"
                    "- Fail (F): Below 40% (Grade Point 0.0 - Must appear for supplementary exams).\n"
                    "Academic Integrity: Plagiarism in assignments, laboratory reports, or project code exceeding 20% "
                    "similarity will result in an immediate grade F and referral to the Disciplinary Committee."
                )
            }
        ]
    },
    {
        "title": "Tuition Fees, Invoicing & Scholarship Guidelines 2026",
        "document_type": "POLICY",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "University Fee Structure & Payment Guidelines:\n"
                    "1. Billing Cycles: Semester tuition invoices are generated at the beginning of each academic term.\n"
                    "2. Payment Due Dates: Tuition and examination fees must be cleared within 15 calendar days from invoice generation.\n"
                    "3. Late Payment Surcharge: Payments received after the due date incur a late fee of ₹100.00 per day for the first 15 days.\n"
                    "4. Payment Portals: Students can settle balances online via Razorpay integrating UPI, debit/credit cards, and NetBanking. "
                    "Digital fee receipts with verification QR codes are issued instantly upon payment confirmation."
                )
            },
            {
                "page": 2,
                "text": (
                    "University Scholarships and Financial Aid:\n"
                    "1. Merit Scholarship: Awarded to students securing top 5% semester ranks or CGPA >= 9.0 (50% tuition waiver).\n"
                    "2. Need-Based Financial Assistance: Up to 40% tuition assistance for students with verified family income below ₹3.0 LPA.\n"
                    "3. Sports & Cultural Excellence Grant: Up to 75% fee concession for university representatives in National games.\n"
                    "Applications must be submitted via the Student Portal under 'Fees & Scholarships' with income certificates and marksheets."
                )
            }
        ]
    },
    {
        "title": "Examination Conduct, Hall Ticket & Evaluation Regulations",
        "document_type": "POLICY",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "Examination Rules and Hall Ticket Issuance:\n"
                    "1. Eligibility Criteria: Students must have zero pending tuition dues and minimum 75% attendance to generate hall tickets.\n"
                    "2. Hall Ticket Download: Digital hall tickets with seat numbers, room allocations, and QR verification codes "
                    "become available on the portal 7 days prior to examination dates.\n"
                    "3. Examination Weightage: Continuous Internal Assessment (CIA / Mid-term tests) accounts for 30% weightage; "
                    "Semester-End Examination (SEE) accounts for 70% weightage.\n"
                    "4. Revaluation: Answer script re-evaluation applications can be filed within 10 days of result publication with a fee of ₹500/subject."
                )
            }
        ]
    },
    {
        "title": "Campus Placement, Internship & Eligibility Rules",
        "document_type": "POLICY",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "Training & Placement Cell (T&P) Hiring Regulations:\n"
                    "1. Eligibility Thresholds: Most hiring partners require minimum 6.5 CGPA with no standing backlogs at the time of recruitment.\n"
                    "2. One Student One Job Policy: Upon receiving a firm job offer, a student is considered placed. However, students may appear "
                    "for 'Dream Company' drives offering packages 2.0x higher than their existing offer (minimum ₹10 LPA threshold).\n"
                    "3. Mandatory Training: Pre-placement training sessions covering data structures, aptitude, and mock technical interviews "
                    "are compulsory for final and pre-final year students.\n"
                    "4. Code of Conduct: Unexcused absence from an interview round after shortlisting leads to debarment from 3 subsequent campus drives."
                )
            }
        ]
    },
    {
        "title": "Central University Library Operations & Circulation Policy",
        "document_type": "POLICY",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "Central University Library Regulations:\n"
                    "1. Operating Hours: Central Library stacks and reading halls are open Monday through Friday from 8:00 AM to 10:00 PM; "
                    "Weekends and public holidays: 10:00 AM to 6:00 PM. Digital library labs operate 24/7 during exam weeks.\n"
                    "2. Borrowing Quota: Undergraduate students may borrow up to 3 physical books simultaneously; postgraduate students up to 5 books.\n"
                    "3. Lending Duration: Standard loan period is 14 calendar days per book copy.\n"
                    "4. Loan Renewal: Books may be renewed once for an additional 14 days provided there are no pending waitlist reservations.\n"
                    "5. Overdue Fine: Late returns are charged at ₹5.00 per day per copy. Fines must be cleared before semester-end clearance."
                )
            }
        ]
    },
    {
        "title": "Computer Science & Engineering Syllabus & Curriculum 2026",
        "document_type": "SYLLABUS",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "Department of Computer Science & Engineering - Core Syllabus Overview:\n"
                    "Semester 1 & 2: Programming Fundamentals (C/C++), Discrete Mathematics, Engineering Physics, Digital Logic.\n"
                    "Semester 3 & 4: Data Structures & Algorithms (CLRS), Object-Oriented Programming (Java/Python), "
                    "Database Management Systems (Relational Algebra, SQL, Normalization, ACID), Computer Organization & Architecture.\n"
                    "Semester 5 & 6: Operating Systems (Concurrency, Scheduling, Virtual Memory), Computer Networks (TCP/IP, OSI model), "
                    "Software Engineering (Agile, Microservices, Design Patterns), Web Technologies (React, Spring Boot, Node.js).\n"
                    "Semester 7 & 8: Artificial Intelligence & Machine Learning, Cloud Computing (AWS/Docker), Capstone Industry Project."
                )
            },
            {
                "page": 2,
                "text": (
                    "Prescribed Reference Textbooks:\n"
                    "- Data Structures & Algorithms: 'Introduction to Algorithms' by Cormen, Leiserson, Rivest, and Stein (CLRS).\n"
                    "- Database Systems: 'Database System Concepts' (7th Ed) by Silberschatz, Korth, and Sudarshan.\n"
                    "- Software Engineering: 'Clean Code: A Handbook of Agile Software Craftsmanship' by Robert C. Martin.\n"
                    "- Computer Networks: 'Computer Networking: A Top-Down Approach' by Kurose and Ross.\n"
                    "- Operating Systems: 'Operating System Concepts' by Silberschatz, Galvin, and Gagne.\n"
                    "All prescribed textbooks are available in multiple physical copies in the Central Library catalog."
                )
            }
        ]
    },
    {
        "title": "Official Campus Notice: Academic Calendar, Timetable & Hackathon",
        "document_type": "NOTICE",
        "chunks": [
            {
                "page": 1,
                "text": (
                    "University Campus Notices & Important Announcements:\n"
                    "1. Mid-Term Examination Schedule: Tests commence from the 2nd Monday of next month. Review classroom timetable slots on portal.\n"
                    "2. Annual Hackathon 2026: 36-hour National Hackathon organized by the CSE department. Registrations open on portal until 25th of this month.\n"
                    "3. Campus Facilities: The university cafeteria operates from 7:30 AM to 9:30 PM. Campus health clinic is open 24/7 with emergency ambulance service.\n"
                    "4. Contact & Student Support: Central Helpdesk: support@university.edu | IT Support: it@university.edu | Phone: +91-1800-UNIV-EDU."
                )
            }
        ]
    }
]

def seed_knowledge_base_if_needed(vector_store: DedicatedVectorStore):
    """
    Checks if knowledge base has been seeded in MySQL.
    If empty, inserts default university policies, syllabus, and notices,
    then updates the dedicated vector store.
    """
    try:
        total_docs = count_knowledge_documents()
        if total_docs == 0:
            log.info("No knowledge documents found. Seeding default university policies, syllabus & notices...")
            for doc in DEFAULT_DOCUMENTS:
                doc_id = save_knowledge_document(
                    title=doc["title"],
                    document_type=doc["document_type"],
                    file_path=None,
                    processing_status="PROCESSED"
                )
                save_document_chunks(doc_id, doc["chunks"])
            log.info(f"Successfully seeded {len(DEFAULT_DOCUMENTS)} knowledge documents into MySQL.")

        # Always ensure the vector store is indexed from MySQL chunks
        if vector_store.is_empty():
            log.info("Indexing document chunks into dedicated vector store...")
            chunks = get_all_chunks()
            if chunks:
                vector_store.build_index(chunks)
                log.info(f"Vector store indexed with {len(chunks)} chunks.")
    except Exception as e:
        log.error(f"Error seeding knowledge base: {e}")
