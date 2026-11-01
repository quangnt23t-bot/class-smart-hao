import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { Forbidden403 } from '../pages/auth/Forbidden403';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/DashboardPage';
import { ClassesPage } from '../pages/teacher/ClassesPage';
import { ClassDetailPage } from '../pages/teacher/ClassDetailPage';
import { StudentsPage } from '../pages/teacher/StudentsPage';
import { StudentProfilePage } from '../pages/teacher/StudentProfilePage';
import { AttendancePage } from '../pages/teacher/AttendancePage';
import { AssignmentsPage } from '../pages/teacher/AssignmentsPage';
import { QuizzesPage } from '../pages/teacher/QuizzesPage';
import { QuestionBankPage } from '../pages/teacher/QuestionBankPage';
import { ResourcesPage } from '../pages/teacher/ResourcesPage';
import { AIAssistantPage } from '../pages/teacher/AIAssistantPage';
import { GradebookPage } from '../pages/teacher/GradebookPage';
import { BehaviorPage } from '../pages/teacher/BehaviorPage';
import { RewardsPage } from '../pages/teacher/RewardsPage';
import { AlertsPage } from '../pages/teacher/AlertsPage';
import { ClassroomToolsPage } from '../pages/teacher/ClassroomToolsPage';
import { AnnouncementsPage } from '../pages/teacher/AnnouncementsPage';
import { ReportsPage } from '../pages/teacher/ReportsPage';
import { SchedulePage } from '../pages/teacher/SchedulePage';
import { ParentsPage } from '../pages/teacher/ParentsPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentAssignments } from '../pages/student/StudentAssignments';
import { StudentGrades } from '../pages/student/StudentGrades';
import { StudentSchedule } from '../pages/student/StudentSchedule';
import { StudentAttendance, StudentAchievements, StudentProfile } from '../pages/student/StudentAttendance';

// Parent Pages
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { ParentGrades } from '../pages/parent/ParentGrades';
import { ParentAttendance, ParentMessages } from '../pages/parent/ParentAttendance';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminAuditLog, AdminBackups, AdminSettings } from '../pages/admin/AdminAuditLog';

export const AppRoutes: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />
      <Route path="/403" element={<Forbidden403 />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={`/${role || 'teacher'}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* TEACHER PORTAL ROUTES */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="guardians" element={<Navigate to="/teacher/parents" replace />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="ai" element={<AIAssistantPage />} />
        <Route path="grades" element={<GradebookPage />} />
        <Route path="attendance-report" element={<AttendancePage />} />
        <Route path="behavior" element={<BehaviorPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="tools" element={<ClassroomToolsPage />} />
        <Route path="tools/:tool" element={<ClassroomToolsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* STUDENT PORTAL ROUTES */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="achievements" element={<StudentAchievements />} />
        <Route path="notifications" element={<AnnouncementsPage />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* PARENT PORTAL ROUTES */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="children" element={<ParentDashboard />} />
        <Route path="grades" element={<ParentGrades />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="assignments" element={<ParentDashboard />} />
        <Route path="achievements" element={<ParentDashboard />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="notifications" element={<AnnouncementsPage />} />
        <Route path="messages" element={<ParentMessages />} />
      </Route>

      {/* ADMIN PORTAL ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="schools" element={<AdminSettings />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminUsers />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="backups" element={<AdminBackups />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
