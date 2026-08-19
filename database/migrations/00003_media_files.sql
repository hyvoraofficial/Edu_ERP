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
