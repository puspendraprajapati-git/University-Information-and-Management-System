import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Departments (10)
const departments = Array.from({ length: 10 }).map((_, i) => ({
  dept_id: i + 1,
  dept_name: faker.commerce.department() + ' Engineering',
  dept_code: faker.string.alpha({ length: 3, casing: 'upper' }),
  hod_id: null, // to be updated after faculty creation
}));

// 2. Semesters (8)
const semesters = Array.from({ length: 8 }).map((_, i) => ({
  semester_id: i + 1,
  semester_name: `Semester ${i + 1}`,
  start_date: faker.date.recent({ days: 180 }).toISOString(),
  end_date: faker.date.soon({ days: 180 }).toISOString(),
  year: i < 2 ? 1 : i < 4 ? 2 : i < 6 ? 3 : 4,
}));

// 3. Users (Admin, Faculty, Students)
let users = [];
let nextUserId = 1;

// Admin user
users.push({
  user_id: nextUserId++,
  username: 'admin',
  password: 'password', // dummy
  email: 'admin@uims.com',
  role: 'admin',
  profile_image: faker.image.avatar(),
});

// 4. Faculty (80)
const faculty = Array.from({ length: 80 }).map((_, i) => {
  const dept = faker.helpers.arrayElement(departments);
  const user = {
    user_id: nextUserId++,
    username: faker.internet.username(),
    password: 'password',
    email: i === 0 ? 'faculty@uims.com' : faker.internet.email(),
    role: 'faculty',
    profile_image: faker.image.avatar(),
  };
  users.push(user);
  return {
    faculty_id: i + 1,
    full_name: faker.person.fullName(),
    dept_id: dept.dept_id,
    qualification: faker.helpers.arrayElement(['Ph.D.', 'M.Tech.', 'M.Sc.']),
    user_id: user.user_id,
  };
});

// Set HODs for departments
departments.forEach((dept) => {
  const deptFaculty = faculty.filter((f) => f.dept_id === dept.dept_id);
  if (deptFaculty.length > 0) {
    dept.hod_id = deptFaculty[0].faculty_id;
  }
});

// 5. Students (1000)
const students = Array.from({ length: 1000 }).map((_, i) => {
  const dept = faker.helpers.arrayElement(departments);
  const sem = faker.helpers.arrayElement(semesters);
  const user = {
    user_id: nextUserId++,
    username: faker.internet.username(),
    password: 'password',
    email: i === 0 ? 'student@uims.com' : faker.internet.email(),
    role: 'student',
    profile_image: faker.image.avatar(),
  };
  users.push(user);
  return {
    student_id: i + 1,
    enrollment_no: `ENR${2020 + faker.number.int({ min: 1, max: 4 })}${faker.string.numeric(5)}`,
    full_name: faker.person.fullName(),
    dept_id: dept.dept_id,
    current_semester: sem.semester_id,
    date_of_birth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString(),
    user_id: user.user_id,
  };
});

// 6. Subjects (120)
const subjects = Array.from({ length: 120 }).map((_, i) => {
  const dept = faker.helpers.arrayElement(departments);
  const sem = faker.helpers.arrayElement(semesters);
  return {
    subject_id: i + 1,
    subject_code: `${dept.dept_code}${100 + i}`,
    subject_name: faker.company.catchPhraseNoun() + ' Systems',
    semester_id: sem.semester_id,
    dept_id: dept.dept_id,
    syllabus_path: '/downloads/syllabus.pdf',
    credits: faker.helpers.arrayElement([2, 3, 4]),
  };
});

// 7. Events (50)
const events = Array.from({ length: 50 }).map((_, i) => ({
  event_id: i + 1,
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  event_date: faker.date.soon({ days: 60 }).toISOString(),
  venue: faker.location.streetAddress(),
  organizer_id: faker.helpers.arrayElement(users.filter((u) => u.role === 'admin' || u.role === 'faculty')).user_id,
  type: faker.helpers.arrayElement(['event', 'news', 'syllabus']),
  file_path: '/downloads/event-info.pdf',
}));

// We won't generate massive Results or Attendance for all 1000 students to avoid huge files in git,
// Instead, we will generate sample results/attendance for a subset (e.g., first 50 students).
const sampleStudents = students.slice(0, 50);
let results = [];
let nextResultId = 1;

let attendance = [];
let nextAttendanceId = 1;

sampleStudents.forEach((student) => {
  // Find subjects for the student's department and current/past semesters
  const studentSubjects = subjects.filter(
    (s) => s.dept_id === student.dept_id && s.semester_id <= student.current_semester
  );

  studentSubjects.forEach((subject) => {
    // Generate result
    const theory = faker.number.int({ min: 30, max: 70 });
    const practical = faker.number.int({ min: 10, max: 30 });
    const total = theory + practical;
    let grade = 'F';
    if (total >= 90) grade = 'O';
    else if (total >= 80) grade = 'A+';
    else if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B+';
    else if (total >= 50) grade = 'B';
    else if (total >= 40) grade = 'C';

    results.push({
      result_id: nextResultId++,
      student_id: student.student_id,
      subject_id: subject.subject_id,
      semester_id: subject.semester_id,
      theory_marks: theory,
      practical_marks: practical,
      total_marks: total,
      grade: grade,
      result_date: faker.date.recent({ days: 30 }).toISOString(),
    });

    // Generate some attendance records (last 10 days)
    for (let d = 0; d < 10; d++) {
      attendance.push({
        attendance_id: nextAttendanceId++,
        student_id: student.student_id,
        subject_id: subject.subject_id,
        faculty_id: faker.helpers.arrayElement(faculty.filter((f) => f.dept_id === subject.dept_id))?.faculty_id || faculty[0].faculty_id,
        attendance_date: faker.date.recent({ days: 10 }).toISOString(),
        status: faker.helpers.arrayElement(['Present', 'Present', 'Present', 'Absent', 'Late']),
        semester_id: subject.semester_id,
      });
    }
  });
});

const db = {
  users,
  departments,
  faculty,
  students,
  semesters,
  subjects,
  events,
  results,
  attendance,
};

fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(db, null, 2));
console.log('Dummy data generated successfully at src/data/db.json');
