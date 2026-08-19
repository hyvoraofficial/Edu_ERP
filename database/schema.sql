-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing or other cryptographic functions in DB
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable trigger function for updating 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Academies (Tenants) Table
CREATE TABLE academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Academy Settings Table (1-to-1 extension of academies)
CREATE TABLE academy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL UNIQUE REFERENCES academies(id) ON DELETE CASCADE,
    logo_id UUID,     -- Mapped to media_files(id) post-creation
    favicon_id UUID,  -- Mapped to media_files(id) post-creation
    primary_color VARCHAR(50) DEFAULT '#4F46E5' NOT NULL,
    secondary_color VARCHAR(50) DEFAULT '#06B6D4' NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    theme VARCHAR(50) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    smtp_settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    payment_gateway_keys JSONB DEFAULT '{}'::jsonb NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    seo_settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Triggers for updated_at
CREATE TRIGGER update_academies_updated_at
BEFORE UPDATE ON academies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_settings_updated_at
BEFORE UPDATE ON academy_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_academies_subdomain ON academies(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX idx_academies_status ON academies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_academy_settings_academy_id ON academy_settings(academy_id);
-- Centralized Media Files (File Manager) Table
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- size in bytes
    storage_path VARCHAR(512) NOT NULL, -- path in S3/Supabase bucket
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'media',
    access_level VARCHAR(50) NOT NULL DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'restricted')),
    uploaded_by UUID, -- Mapped to users(id) post-creation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Triggers for updated_at
CREATE TRIGGER update_media_files_updated_at
BEFORE UPDATE ON media_files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance & tenant isolation
CREATE INDEX idx_media_files_academy_id ON media_files(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type) WHERE deleted_at IS NULL;

-- Link back to academy_settings now that media_files table exists
ALTER TABLE academy_settings 
ADD CONSTRAINT fk_academy_settings_logo_id FOREIGN KEY (logo_id) REFERENCES media_files(id) ON DELETE SET NULL;

ALTER TABLE academy_settings 
ADD CONSTRAINT fk_academy_settings_favicon_id FOREIGN KEY (favicon_id) REFERENCES media_files(id) ON DELETE SET NULL;
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    avatar_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_users_academy_email UNIQUE (academy_id, email)
);

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE, -- NULL for system-wide roles
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_roles_academy_code UNIQUE (academy_id, code)
);

-- Permissions Table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Role Permissions Join Table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- User Roles Join Table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- Link uploaded_by back to users in media_files
ALTER TABLE media_files 
ADD CONSTRAINT fk_media_files_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON role_permissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for tenant isolation and queries
CREATE INDEX idx_users_academy_id ON users(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_roles_academy_id ON roles(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id) WHERE deleted_at IS NULL;
-- Teachers Profile Table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) NOT NULL,
    specialization VARCHAR(100)[] DEFAULT '{}'::varchar[] NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary NUMERIC(12, 2) CHECK (salary >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_teachers_academy_employee_id UNIQUE (academy_id, employee_id)
);

-- Students Profile Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admission_number VARCHAR(100) NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_group VARCHAR(20),
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    parent_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_students_academy_admission_number UNIQUE (academy_id, admission_number)
);

-- Triggers for updated_at
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON teachers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_teachers_academy_id ON teachers(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_academy_id ON students(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_admission_number ON students(admission_number) WHERE deleted_at IS NULL;
-- Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    duration_months INT CHECK (duration_months > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_courses_academy_code UNIQUE (academy_id, code)
);

-- Subjects Table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_subjects_academy_code UNIQUE (academy_id, code)
);

-- Course Subjects Join Table
CREATE TABLE course_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_course_subject UNIQUE (course_id, subject_id)
);

-- Batches Table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_strength INT CHECK (max_strength > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_batch_dates CHECK (start_date <= end_date)
);

-- Batch Students Join Table
CREATE TABLE batch_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    roll_number VARCHAR(50),
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'active', 'dropped', 'graduated', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_batch_student UNIQUE (batch_id, student_id),
    CONSTRAINT uq_batch_roll_number UNIQUE (batch_id, roll_number)
);

-- Batch Teachers Join Table
CREATE TABLE batch_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_primary_tutor BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_batch_teacher_subject UNIQUE (batch_id, teacher_id, subject_id)
);

-- Class Schedules Table
CREATE TABLE class_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 (Mon) - 7 (Sun)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_class_time CHECK (start_time < end_time)
);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_subjects_updated_at BEFORE UPDATE ON course_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_students_updated_at BEFORE UPDATE ON batch_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_teachers_updated_at BEFORE UPDATE ON batch_teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON class_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_courses_academy ON courses(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subjects_academy ON subjects(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_academy ON batches(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_course ON batches(course_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batch_students_batch ON batch_students(batch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batch_students_student ON batch_students(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_class_schedules_batch ON class_schedules(batch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_class_schedules_day_time ON class_schedules(day_of_week, start_time) WHERE deleted_at IS NULL;
-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    class_schedule_id UUID REFERENCES class_schedules(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_student_attendance UNIQUE (student_id, date, batch_id, class_schedule_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_attendance_academy ON attendance(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_batch_date ON attendance(batch_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date) WHERE deleted_at IS NULL;
-- Fee Structures Table
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    frequency VARCHAR(50) NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly', 'term', 'quarterly', 'annual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Fee Allocations Table
CREATE TABLE fee_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'void')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_fee_allocation_math CHECK (paid_amount + discount_amount <= total_amount)
);

-- Payment Transactions Table (Tracking attempts, details and retry info)
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_allocation_id UUID NOT NULL REFERENCES fee_allocations(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    payment_method VARCHAR(100) CHECK (payment_method IN ('card', 'net_banking', 'upi', 'wallet', 'cash', 'bank_transfer', 'cheque', 'gateway')),
    gateway_provider VARCHAR(100), -- 'razorpay', 'stripe'
    gateway_order_id VARCHAR(255),
    gateway_transaction_ref VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    failure_reason TEXT,
    gateway_response JSONB DEFAULT '{}'::jsonb NOT NULL,
    retry_count INT DEFAULT 0 NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payments Table (Realized ledger/receipt record)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_allocation_id UUID NOT NULL REFERENCES fee_allocations(id) ON DELETE CASCADE,
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    receipt_number VARCHAR(100) NOT NULL,
    payment_mode VARCHAR(100) NOT NULL,
    reference_no VARCHAR(255),
    remarks TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_payments_receipt_number UNIQUE (academy_id, receipt_number)
);

-- Triggers for updated_at
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_allocations_updated_at BEFORE UPDATE ON fee_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_fee_structures_academy ON fee_structures(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_fee_allocations_student ON fee_allocations(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_fee_allocations_status ON fee_allocations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_payment_transactions_order ON payment_transactions(gateway_order_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_allocation ON payments(fee_allocation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_receipt ON payments(academy_id, receipt_number) WHERE deleted_at IS NULL;
-- Study Materials Table
CREATE TABLE study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE RESTRICT,
    access_level VARCHAR(50) NOT NULL DEFAULT 'batch_only' CHECK (access_level IN ('public', 'registered', 'batch_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Study Material Batches Mapping Table
CREATE TABLE study_material_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    study_material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_study_material_batch UNIQUE (study_material_id, batch_id)
);

-- Video Lectures Table
CREATE TABLE video_lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    media_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    external_video_url VARCHAR(512),
    video_provider VARCHAR(50) NOT NULL DEFAULT 'youtube' CHECK (video_provider IN ('youtube', 'vimeo', 'custom', 'external')),
    thumbnail_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    duration_seconds INT CHECK (duration_seconds >= 0),
    access_level VARCHAR(50) NOT NULL DEFAULT 'batch_only' CHECK (access_level IN ('public', 'registered', 'batch_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_video_source CHECK (media_file_id IS NOT NULL OR external_video_url IS NOT NULL)
);

-- Video Lecture Batches Mapping Table
CREATE TABLE video_lecture_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    video_lecture_id UUID NOT NULL REFERENCES video_lectures(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_video_lecture_batch UNIQUE (video_lecture_id, batch_id)
);

-- Assignments Table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    max_marks NUMERIC(6, 2) NOT NULL CHECK (max_marks > 0),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    media_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Assignment Submissions Table
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE RESTRICT,
    student_remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late_submission', 'resubmission_required')),
    marks_obtained NUMERIC(6, 2) CHECK (marks_obtained >= 0),
    teacher_remarks TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_assignment_submission UNIQUE (assignment_id, student_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_material_batches_updated_at BEFORE UPDATE ON study_material_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_lectures_updated_at BEFORE UPDATE ON video_lectures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_lecture_batches_updated_at BEFORE UPDATE ON video_lecture_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_study_materials_academy ON study_materials(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_video_lectures_academy ON video_lectures(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_batch ON assignments(batch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_due_date ON assignments(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id) WHERE deleted_at IS NULL;
-- Exams Table (Top level schedule container)
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exam_type VARCHAR(100) NOT NULL DEFAULT 'term' CHECK (exam_type IN ('term', 'final', 'quiz', 'class_test', 'mid_term')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_exam_dates CHECK (start_date <= end_date)
);

-- Exam Papers Table (Individual test definitions)
CREATE TABLE exam_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    max_marks NUMERIC(6, 2) NOT NULL CHECK (max_marks > 0),
    passing_marks NUMERIC(6, 2) NOT NULL CHECK (passing_marks > 0),
    question_paper_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_exam_passing_marks CHECK (passing_marks <= max_marks)
);

-- Exam Results Table (Student gradings)
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    exam_paper_id UUID NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(6, 2) CHECK (marks_obtained >= 0),
    remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pass' CHECK (status IN ('pass', 'fail', 'absent', 'malpractice')),
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_exam_result UNIQUE (exam_paper_id, student_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_papers_updated_at BEFORE UPDATE ON exam_papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON exam_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_exams_academy ON exams(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exam_papers_exam ON exam_papers(exam_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exam_papers_batch ON exam_papers(batch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exam_results_student ON exam_results(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exam_results_paper ON exam_results(exam_paper_id) WHERE deleted_at IS NULL;
-- Website Pages Table
CREATE TABLE website_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_website_page_slug UNIQUE (academy_id, slug)
);

-- Gallery Albums Table
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Gallery Images Table
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE RESTRICT,
    caption TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Testimonials Table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    avatar_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Contact Enquiries Table
CREATE TABLE contact_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    response_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Admission Enquiries Table
CREATE TABLE admission_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    student_first_name VARCHAR(150) NOT NULL,
    student_last_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    parent_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'admission_granted', 'rejected')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Triggers for updated_at
CREATE TRIGGER update_website_pages_updated_at BEFORE UPDATE ON website_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_albums_updated_at BEFORE UPDATE ON gallery_albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_enquiries_updated_at BEFORE UPDATE ON contact_enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admission_enquiries_updated_at BEFORE UPDATE ON admission_enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_website_pages_slug ON website_pages(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_gallery_images_album ON gallery_images(album_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_contact_enquiries_status ON contact_enquiries(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_admission_enquiries_status ON admission_enquiries(status) WHERE deleted_at IS NULL;
-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'in_app' CHECK (type IN ('email', 'sms', 'push', 'in_app')),
    status VARCHAR(50) NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'read', 'failed')),
    read_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- High-level Activity Logs (Range-Partitioned on created_at)
CREATE TABLE activity_logs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'USER_LOGIN', 'FEE_PAYMENT', 'MATERIAL_UPLOAD'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Default partition for activity_logs to catch fallback inserts
CREATE TABLE activity_logs_default PARTITION OF activity_logs DEFAULT;

-- Detailed Audit Logs (Range-Partitioned on created_at for compliance tracking)
CREATE TABLE audit_logs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id UUID, -- NULL for system-level triggers
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
    resource_type VARCHAR(100) NOT NULL, -- 'students', 'fee_allocations'
    resource_id UUID NOT NULL,
    original_values JSONB DEFAULT '{}'::jsonb NOT NULL,
    new_values JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Default partition for audit_logs
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- Triggers for updated_at
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_status ON notifications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_logs_academy ON activity_logs(academy_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
-- Dashboard Analytics Cache Table (For pre-computed statistics)
CREATE TABLE dashboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    metric_key VARCHAR(100) NOT NULL, -- e.g. 'total_students', 'revenue_monthly', 'attendance_rate'
    metric_value NUMERIC(16, 4) NOT NULL,
    dimension VARCHAR(100), -- 'batch', 'course', 'overall'
    dimension_id UUID,
    raw_data JSONB DEFAULT '{}'::jsonb NOT NULL, -- For complex chart structures/arrays
    cached_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_academy_metric_dimension UNIQUE (academy_id, metric_key, dimension, dimension_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_cache_updated_at BEFORE UPDATE ON dashboard_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_dashboard_cache_lookup ON dashboard_cache(academy_id, metric_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_dashboard_cache_expiry ON dashboard_cache(cached_until) WHERE deleted_at IS NULL;
