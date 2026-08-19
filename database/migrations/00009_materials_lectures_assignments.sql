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
