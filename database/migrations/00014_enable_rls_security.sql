-- ==========================================
-- HYVORA EduERP - Migration 00014: Enable Row Level Security (RLS) on all Public Tables
-- ==========================================

-- Enable RLS on all tables in public schema to resolve Supabase Security Advisor Critical Warnings
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        -- 1. Enable Row Level Security on target table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);

        -- 2. Drop existing policy if present and grant full bypass policy to Supabase service_role
        EXECUTE format('DROP POLICY IF EXISTS service_role_all ON public.%I;', r.tablename);
        EXECUTE format('CREATE POLICY service_role_all ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', r.tablename);
    END LOOP; 
END $$;
