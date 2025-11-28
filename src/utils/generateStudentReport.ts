// Utility to generate a PDF report from analytics data using jsPDF and html2canvas
// Usage: import and call generateStudentReport(analytics, studentInfo)
import jsPDF from 'jspdf';

// Define types for analytics and studentInfo (basic, can be extended)
type StudentInfo = {
  name?: string;
  email?: string;
  enrollmentDate?: string;
};

type Analytics = {
  overview: any;
  courseProgress: any[];
  weeklyStats: any[];
  achievements: any[];
};

export async function generateStudentReport(
  analytics: Analytics,
  studentInfo: StudentInfo
) {
  const doc = new jsPDF('p', 'pt', 'a4');
  let y = 40;

  // Title
  doc.setFontSize(22);
  doc.text('Student Progress Report', 40, y);
  y += 30;

  // Student Info
  doc.setFontSize(12);
  doc.text(`Name: ${studentInfo.name || ''}`, 40, y);
  y += 18;
  doc.text(`Email: ${studentInfo.email || ''}`, 40, y);
  y += 18;
  doc.text(`Enrollment Date: ${studentInfo.enrollmentDate || ''}`, 40, y);
  y += 30;

  // Overall Progress
  doc.setFontSize(16);
  doc.text('Overall Progress', 40, y);
  y += 20;
  doc.setFontSize(12);
  doc.text(`Courses Enrolled: ${analytics.overview.totalCoursesEnrolled}`, 40, y);
  y += 16;
  doc.text(`Courses Completed: ${analytics.overview.totalCoursesCompleted}`, 40, y);
  y += 16;
  doc.text(`Lessons Completed: ${analytics.overview.totalLessonsCompleted}`, 40, y);
  y += 16;
  doc.text(`Quizzes Taken: ${analytics.overview.totalQuizzesTaken || 0}`, 40, y);
  y += 16;
  doc.text(`Average Quiz Score: ${analytics.overview.averageQuizScore}%`, 40, y);
  y += 16;
  doc.text(`Total Study Time: ${Math.round((analytics.overview.totalStudyTime || 0) / 60)}h`, 40, y);
  y += 30;

  // Course Progress Table
  doc.setFontSize(16);
  doc.text('Course Progress', 40, y);
  y += 20;
  doc.setFontSize(10);
  analytics.courseProgress.forEach((course: any, idx: number) => {
    doc.text(`${idx + 1}. ${course.courseTitle} - ${course.progress}% complete`, 40, y);
    y += 14;
    doc.text(`   Lessons: ${course.lessonsCompleted}/${course.totalLessons} | Quizzes: ${course.quizzesTaken} | Avg Score: ${course.averageQuizScore}% | Time: ${Math.round((course.timeSpent || 0) / 60)}h`, 40, y);
    y += 14;
    if (y > 750) { doc.addPage(); y = 40; }
  });
  y += 20;

  // Weekly Performance Table
  doc.setFontSize(16);
  doc.text('Weekly Performance', 40, y);
  y += 20;
  doc.setFontSize(10);
  analytics.weeklyStats.forEach((week: any) => {
    doc.text(`${week.week}: Lessons ${week.lessonsCompleted}, Quizzes ${week.quizzesTaken}, Time ${Math.round((week.totalTimeSpent || 0) / 60)}h, Avg Score ${week.averageQuizScore}%`, 40, y);
    y += 14;
    if (y > 750) { doc.addPage(); y = 40; }
  });
  y += 20;

  // Achievements
  doc.setFontSize(16);
  doc.text('Achievements & Badges', 40, y);
  y += 20;
  doc.setFontSize(10);
  analytics.achievements.forEach((ach: any) => {
    doc.text(`${ach.name}: ${ach.description} (${Math.round(ach.progress)}%)`, 40, y);
    y += 14;
    if (y > 750) { doc.addPage(); y = 40; }
  });
  y += 20;

  // Save PDF
  doc.save('student_report.pdf');
}
