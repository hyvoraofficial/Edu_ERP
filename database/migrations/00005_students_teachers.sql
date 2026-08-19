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
