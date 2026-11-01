# SMART CLASS – Hệ thống quản lý lớp học thông minh

Nền tảng quản lý lớp học số và đồng hành giáo dục toàn diện dành cho **Giáo viên, Học sinh, Phụ huynh và Quản trị viên**.

---

## 1. Giới thiệu

**SMART CLASS** là giải pháp phần mềm giáo dục thông minh giải quyết triệt để bài toán quản lý lớp học tập trung:
- **Giáo viên**: Workspace trung tâm quản lý lớp, học sinh, điểm danh di động, sổ điểm spreadsheet, giao bài & chấm bài trực tiếp, ngân hàng câu hỏi, học liệu, trợ lý AI tạo giáo án & đề kiểm tra, cùng bộ công cụ lớp học trực quan (Vòng quay may mắn, Bốc thăm ngẫu nhiên, Chia nhóm, Đồng hồ đếm giờ, Quiz nhanh).
- **Học sinh**: Cổng tự học cá nhân hóa với thời khóa biểu, bài tập cần nộp, lịch kiểm tra, bảng điểm, huy hiệu thành tích và trao đổi học tập (chỉ xem dữ liệu của chính mình).
- **Phụ huynh**: Sổ liên lạc điện tử đa năng tích hợp **Child Switcher** (chuyển đổi mượt mà giữa các con), theo dõi bảng điểm, chuyên cần, tiến độ học tập và nhắn tin 2 chiều với giáo viên chủ nhiệm.
- **Quản trị viên (Admin)**: Quản lý người dùng, phân quyền Role-Based Access Control (RBAC), quản lý cấu hình trường học, xem nhật ký kiểm toán (Audit Trail) và sao lưu dữ liệu hệ thống.

---

## 2. Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti.
- **Routing**: React Router v7 với RBAC Protected Routes, 403 Forbidden Guard và Query Param Tabs.
- **State & Storage**: LocalStorage Persistence Layer với cơ chế khởi tạo seed dữ liệu mẫu phong phú và khôi phục nguyên bản (Reset to Demo) bất kỳ lúc nào.
- **AI Integration**: Trợ lý AI giáo dục tích hợp mô hình Gemini (`gemini-3.8-flash`) qua Server Proxy Express an toàn, tuân thủ nguyên tắc sư phạm: *AI chỉ đề xuất -> Giáo viên Xem -> Chỉnh sửa -> Duyệt -> Ban hành*.

---

## 3. Tài khoản Demo trải nghiệm nhanh (1-Click Login)

Hệ thống tích hợp sẵn nút bấm chuyển đổi vai trò nhanh trên thanh Header hoặc màn hình Đăng nhập:

| Vai trò | Họ và tên | Email đăng nhập | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Giáo viên** | Cô Nguyễn Thị Lan | `lan.nguyen@smartclass.edu.vn` | `123456` | Chủ nhiệm 6A1, dạy Toán 6A2, 7A1 |
| **Học sinh** | Trần Đức Anh | `ducanh.tran@smartclass.edu.vn` | `123456` | Học sinh lớp 6A1 |
| **Phụ huynh** | Trần Văn Bình | `binh.tran@gmail.com` | `123456` | Phụ huynh em Đức Anh (6A1) & Mai Trang (7A1) |
| **Quản trị viên** | Thầy Lê Hoàng Nam | `admin@smartclass.edu.vn` | `123456` | Quản trị trường THCS Chu Văn An |

---

## 4. Cấu trúc thư mục

```text
src/
├── components/
│   ├── common/         # Header, Sidebar, Breadcrumb, Modal, ConfirmDialog, EmptyState
│   └── tools/          # Tool Hub: WheelOfFortune, RandomPicker, GroupMaker, ClassroomTimer, QuickQuiz
├── contexts/           # AuthContext, ClassContext, ToastContext
├── data/               # mockData.ts (seed chuẩn), storage.ts (CRUD & LocalStorage)
├── layouts/            # AppLayout (Header, Sidebar, Modals nhanh), AuthLayout
├── pages/
│   ├── auth/           # LoginPage, RegisterPage, Forbidden403
│   ├── teacher/        # Dashboard, Classes, ClassDetail, Students, StudentProfile, Attendance, Assignments, Quizzes, QuestionBank, Resources, AIAssistant, Gradebook, Behavior, Rewards, Alerts, Tools, Announcements, Reports, Schedule
│   ├── student/        # Dashboard, Schedule, Assignments, Quizzes, Grades, Attendance, Achievements, Profile
│   ├── parent/         # Dashboard (Child Switcher), Grades, Attendance, Messages
│   └── admin/          # Dashboard, Users, AuditLog, Backups, Settings
├── routes/             # AppRoutes, ProtectedRoute
├── types/              # Type definitions chuẩn cho trường học
└── server.ts           # Full-stack Express server với Vite middleware & AI proxy
```

---

## 5. Hướng dẫn Cài đặt & Chạy ứng dụng

### Chạy Development
```bash
npm install
npm run dev
```

Dev server sẽ khởi động tại `http://localhost:3000`.

### Build Production
```bash
npm run build
npm run start
```
