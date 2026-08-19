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
