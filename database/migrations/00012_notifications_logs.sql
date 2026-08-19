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
