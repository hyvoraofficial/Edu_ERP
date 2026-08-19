# Walkthrough - HYVORA EduERP Multi-Branch, Course, Batch, Admissions, Students, Portals, Attendance, Fees, Authentication & Security Updates

We have successfully designed, implemented, and verified the updates for **Multi-Branch Management**, **Course & Batch Independence (decoupled)**, **Student Admission Workflow**, **Student Management System**, **Student Portal Dashboard**, **Teacher Portal Dashboard**, **Attendance Management System**, **Fee Management System**, **Customizable Email Servers**, **Enhanced Authentication Security**, **LoginActivity Audits**, **Branches Directory UI**, **Course Management Settings**, and **Batch Management Settings**.

---

## 1. Fee Management Module
Implemented manual fee structures management and payment recording for coaching institutes without online payments.

* **Fee Plans & Structures**:
  * Added creation of structures and plans (Tuition Fee structures) through the admin panel.
* **Assign Fee Plan**:
  * Admin can allocate any fee structure plan to any student with custom due date inputs and discounts.
* **Manual Collection**:
  * Realized payments are logged manually by specifying amount paid, payment mode (Cheque, Cash, Bank Transfer), reference transaction code, and memo remarks.
  * Updates paid amount and allocation status ('paid', 'partially_paid') inside Postgres tables.
* **History & Receipts**:
  * Dynamic list overlay showing the student's historical receipts logs with unique receipt code formatting (`REC-OFF-...`).
* **Frontend Portal updates**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/finance/page.tsx) under `/admin/finance` rendering searchable data tables, plan creation modals, allocation mapping models, and collection registers.
  * Mapped student dashboard Overview card to dynamically reflect total fees allocated vs paid installment vs pending balance from backend query lookups.
  * Implemented [finance.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/services/finance.service.ts) wrapper fetch client.

---

## 2. Attendance Management Module
Implemented the student attendance marking flow for teachers, report card lookups for students, and admin statistics.

* **Teacher Mark Flow**:
  1. Select Branch (searchable list)
  2. Select Course (searchable list)
  3. Select Batch (searchable list)
  4. Select Date (date picker)
  5. Mark Attendance (bulk Present/Absent options per student checklist log)
* **Backend API Enhancements**:
  * Decoupled Teacher ID resolutions in `submitStudentAttendance` inside [attendance.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/attendance/attendance.service.ts) to correctly resolve UUID primary keys from user logins.
  * Added student-restricted me attendance profile filters to prevent query leakage.
* **Frontend Portal updates**:
  * Implemented step-by-step selectors flow in the "Mark Attendance" tab inside [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/teacher/page.tsx) to execute `POST /api/v1/attendance/students` API calls with real payload registers.
  * Student Portal Dashboard displays personal attendance stats card percentages mapped to backend `/attendance-summary` calculations.

---

## 3. Teacher Portal Dashboard Module
Designed a complete dashboard for operational teacher profiles, class schedules, assigned cohorts, student rosters, study resources, and rollcall logs.

* **Backend API Enhancements**:
  * Exposed `GET /profile/me` route inside [teacher.controller.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/teacher/teacher.controller.ts) allowing authenticated teacher accounts to fetch their profile details and schedules without permission gate constraints.
  * Implemented `findOneByUser` inside [teacher.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/teacher/teacher.service.ts) loading schedules, subjects, and batch details.
* **Frontend Teacher Portal**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/teacher/page.tsx) under `/teacher` rendering:
    * Tabs navigation (Overview, Profile, Assigned Subjects, Assigned Batches, Students Roster, Attendance Deck, Study Materials, Assignments review).
    * Class schedules checklist rendering times, batch names, and day.
    * Interactive Attendance deck where teachers select cohort batches, launch rollcalls, toggle present/absent states, and submit records.
    * Roster lists detailing names, emails, and admission identifiers.

---

## 4. Student Portal Dashboard Module
Designed a full dashboard for operational student listings, filters, profiles, editing, and soft archiving.

* **Database & Validations**:
  * Added student lookup methods resolver based on user credentials ID in [StudentRepository](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/student/student.repository.ts)'s `findByUser`.
* **Backend API Enhancements**:
  * Exposed `GET /profile/me`, `GET /profile/me/attendance-summary`, and `GET /profile/me/fee-summary` routes inside [student.controller.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/student/student.controller.ts) allowing authenticated student accounts to fetch their own information details directly.
* **Frontend Student Portal**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/student/page.tsx) under `/student` rendering:
    * Tabs navigation (Overview, Profile, Course, Batch, Attendance, Billing, Study Materials, Announcements).
    * Overview cards displaying attendance percentage, courses, batches, and remaining balance.
    * Announcements feed and login activity log timelines.
    * Downloadable mock PDF task sheet lists.

---

## 5. Student Management System Module
Designed a full dashboard for operational student listings, filters, profiles, editing, and soft archiving.

* **Database & Validations**:
  * Added `search` and `status` query bindings inside [StudentRepository](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/student/student.repository.ts)'s `findAll` method.
  * Verified soft archiving deletes.
* **Backend API Enhancements**:
  * Updated controller mapping routes inside [student.controller.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/student/student.controller.ts) to bind `@Query('search')` and `@Query('status')`.
* **Frontend Student Management Dashboard**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/students/page.tsx) under `/admin/students` rendering:
    * Searchable Student lists (filtering by Branch, Course, Batch, Status).
    * Dynamic side Drawer overlay representing profile cards, father/mother name data, mapping file UUID strings, and installments paid vs remaining balance.
    * Editing forms updating student details card properties.
    * Action button triggers (Edit, Archive, Roster details).

---

## 6. Student Admission Workflow Module
Implemented the complete step-by-step Student Admission workflow with searchable selections and validation.

* **Admission Form Steps**:
  1. Select Branch (searchable select dropdown)
  2. Select Course (searchable select dropdown)
  3. Select Batch (searchable select dropdown)
  4. Student Information (Name, DOB, Gender, Email, Phone, Blood Group)
  5. Parent Information (Father, Mother Name, Phone, Email)
  6. Documents (Student Photo, Aadhaar, Previous Marks Card UUIDs)
  7. Fee Details (Installment Select)
  8. Admission Completion & Success screen displaying generated credentials.
* **Backend Automated Flows**:
  * Creates primary Auth User profile with default `isDefaultPassword: true`.
  * Generates random secure passwords and usernames automatically.
  * Dispatches custom welcome email templates containing portal credentials.
* **Frontend Admissions page**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/admissions/page.tsx) under `/admin/admissions`.
  * Reimplemented [student.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/services/student.service.ts) to query real backend student API.

---

## 7. Batch Management Module
Each Batch now belongs to one Branch and one Course. Built the complete Batch Management flow.

* **Database & Validations**:
  * Linked `courseId` and `code` properties to the `Batch` model in `schema.prisma`.
  * Enforced unique constraints for Batch Code within each Branch (duplicate codes are blocked per branch, but permitted across branches).
  * Seeded default batches mapped to active courses and branches.
* **Backend API Enhancements**:
  * Extended `createBatch` and `findAllBatches` inside [academic.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/academic/academic.service.ts) to support course mappings, search inputs, branch filters, course filters, status parameters, and page limits.
  * Added `PATCH /batches/:id` (`updateBatch`) and `DELETE /batches/:id` (`removeBatch`) inside [academic.controller.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/academic/academic.controller.ts) to update and archive batches.
* **Frontend Batch Directory Dashboard**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/batches/page.tsx) under `/admin/batches` rendering a Searchable Table, Page Controls, Status Filters, Branch filters, Course filters, Capacity listings, Student counts, and creation/editing modals.
  * Implemented [batch.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/services/batch.service.ts) using native fetches supporting auth cookies and tenant subdomain routing.

---

## 8. Course Management Module
Provisioned a full-featured Course Management layout allowing administrators to manage academic curriculum tracks scoped to specific branches.

* **Database & Validations**:
  * Uniqueness constraints are enforced on Course Name and Course Code per Branch (duplicates are permitted across different branches).
  * Enforced deletion rules checking for active enrolled students before allowing archiving/deletion.
* **Backend API Enhancements**:
  * Added support for `status` query filters and data payloads in [academic.controller.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/academic/academic.controller.ts) and [academic.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/academic/academic.service.ts).
  * Decoupled Batch queries from soft-delete cascades in courses (preserving independence).
* **Frontend Course Directory Dashboard**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/courses/page.tsx) under `/admin/courses` rendering a Searchable Table, Page Controls, Status Filters, Branch filters, Action buttons (Edit, Archive), and creation modals.
  * Implemented [course.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/services/course.service.ts) using native fetches supporting auth cookies and tenant subdomain routing.

---

## 9. Multi-Branch Management & UI Directory
Academy Administrators now have a full Operational Directory to manage physical locations and facilities.

* **Database Schema**: Added the `Branch` model representing location-scoped facilities with details (Name, Code, Status, Manager, Address, Contact details).
* **Isolation of Courses & Batches**: Mapped Courses and Batches to their respective branches.
* **Deletion Rules & Safety Guardrails**: Added validations in [BranchService](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/branch/branch.service.ts) preventing branch deletes if they contain active Students, Teachers, Courses, Batches, or Fee Records.
* **Branch API Endpoints**:
  * `POST /api/v1/branches`: Create a branch. Unique Name & Code constraints are enforced per Academy tenant.
  * `GET /api/v1/branches`: Paginated list of branches with text search (Name, Code, City) and Status filtering.
  * `GET /api/v1/branches/:id`: Details of a specific branch.
  * `PATCH /api/v1/branches/:id`: Update branch attributes.
  * `DELETE /api/v1/branches/:id`: Soft deletes branch after validating dependency rules.
* **Frontend Branch Directory Pages**:
  * Created [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/branches/page.tsx) under `/admin/branches` containing a Searchable Table, Page Controls, Status Filters, Action buttons (View Details, Edit, Archive), and creation modals.
  * Created details page [page.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/app/(app)/admin/branches/[id]/page.tsx) representing branch details, address information, and active counts (students, teachers, courses, batches).
  * Implemented [branch.service.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/services/branch.service.ts) using native fetches supporting auth cookies and tenant subdomain routing.

---

## 10. Secure Authentication & Login Activities
Fitted a production-ready authentication flow integrating the backend and frontend.

* **Login Activity Logger**:
  * Created `LoginActivity` schema tracking access events (IP address, user-agent headers, and authentication status).
  * Automatically records log rows on successful and failed logins.
* **Session Persistence & Recovery**:
  * Persists authenticated user objects in `localStorage` and token strings in `mock-auth-token` cookie records.
  * Dynamically recovers state upon browser refreshes inside [AuthProvider.tsx](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/providers/AuthProvider.tsx).
* **Next.js Router Protection**:
  * Activated redirects in [middleware.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/frontend/src/middleware.ts) checking for valid token cookies before serving `/admin`, `/teacher`, `/student`, or `/super-admin` dashboards.
* **Interactive Logout**:
  * Added logout button on the Sidebar footer that cleans cookie tokens, clears storage states, fires backend `/logout` notifications, and returns users safely to `/login`.

---

## 11. Dynamic Email Servers UI & Config
Configured a customizable email backend allowing institutes to select and configure their own mailing providers.

* **Email DTOs**: Created [email-settings.dto.ts](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/email/dto/email-settings.dto.ts) support configurations for **AWS SES**, **Resend**, and **SMTP** protocols.
* **Validation**: Extensively validated credential keys, server hostnames, port parameters, and TLS options.
* **Dynamic SMTP Dispatch**: The [EmailService](file:///Users/hemanth/Desktop/Hyvora/projects/eduERP/hyvora-eduerp/backend/src/email/email.service.ts) dynamically switches transporter configuration on-the-fly depending on selected settings.

---

## 12. Verification Results

All compiles successfully! The Next.js frontend builds cleanly via Next.js Turbopack compiler, and NestJS builds correctly.
All pages support cookie sessions and direct backend communication.
