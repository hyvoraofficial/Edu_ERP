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
