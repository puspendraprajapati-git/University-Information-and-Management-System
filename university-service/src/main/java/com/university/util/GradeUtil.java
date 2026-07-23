package com.university.util;

public class GradeUtil {

    // Grade boundaries out of 200 total (100 theory + 100 practical)
    public static String calculateGrade(int totalMarks) {
        double percentage = (totalMarks / 200.0) * 100;

        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        return "F";
    }

    // Grade point mapping for GPA calculation
    public static double gradeToPoint(String grade) {
        return switch (grade) {
            case "O" -> 10.0;
            case "A+" -> 9.0;
            case "A" -> 8.0;
            case "B+" -> 7.0;
            case "B" -> 6.0;
            case "C" -> 5.0;
            default -> 0.0; // F
        };
    }
}