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
