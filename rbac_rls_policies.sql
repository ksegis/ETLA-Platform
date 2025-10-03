-- RLS Policies for ETLA Platform

-- Enable RLS on tables that need tenant-level isolation
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;
-- Add other tables as needed

-- 1. Policy for 'tenants' table
-- Host admins can see all tenants. Tenant admins/managers/employees can only see their own tenant.
CREATE POLICY "Allow all access for host_admin and own tenant for others on tenants" ON public.tenants
  FOR SELECT USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = id) = 'host_admin'
    OR
    id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  );

-- 2. Policy for 'tenant_users' table
-- Host admins can see all tenant_users. Tenant admins can see tenant_users within their tenant.
-- Managers/Employees can only see their own tenant_user record.
CREATE POLICY "Allow all access for host_admin, tenant_admin for own tenant, and own record for others on tenant_users" ON public.tenant_users
  FOR SELECT USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'host_admin'
    OR
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
    OR
    user_id = auth.uid()
  );

-- Allow tenant_admin to insert new tenant_users within their tenant
CREATE POLICY "Allow tenant_admin to insert tenant_users within their tenant" ON public.tenant_users
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
  );

-- Allow tenant_admin to update tenant_users within their tenant
CREATE POLICY "Allow tenant_admin to update tenant_users within their tenant" ON public.tenant_users
  FOR UPDATE USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
  ) WITH CHECK (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
  );

-- Allow tenant_admin to delete tenant_users within their tenant
CREATE POLICY "Allow tenant_admin to delete tenant_users within their tenant" ON public.tenant_users
  FOR DELETE USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
  );

-- 3. Policy for 'timecards' table
-- Host admins and tenant admins can see all timecards within their tenant.
-- Managers can see timecards of employees within their tenant.
-- Employees can only see their own timecards.
CREATE POLICY "Allow access to timecards based on role and tenant" ON public.timecards
  FOR SELECT USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'host_admin'
    OR
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
    OR
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'manager'
    OR
    user_id = auth.uid()
  );

-- Allow employees to insert/update/delete their own timecards
CREATE POLICY "Allow employees to manage their own timecards" ON public.timecards
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Policy for 'projects' table
-- Host admins and tenant admins can see all projects within their tenant.
-- Managers/Employees can see projects they are assigned to within their tenant.
CREATE POLICY "Allow access to projects based on role and tenant" ON public.projects
  FOR SELECT USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'host_admin'
    OR
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
    OR
    id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

-- 5. Policy for 'work_requests' table
-- Host admins and tenant admins can see all work requests within their tenant.
-- Managers/Employees can see work requests they created or are assigned to within their tenant.
CREATE POLICY "Allow access to work_requests based on role and tenant" ON public.work_requests
  FOR SELECT USING (
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'host_admin'
    OR
    (SELECT role FROM public.tenant_users WHERE user_id = auth.uid() AND tenant_id = tenant_id) = 'tenant_admin'
    OR
    user_id = auth.uid() -- Creator of the work request
    OR
    id IN (SELECT work_request_id FROM public.work_request_assignments WHERE user_id = auth.uid()) -- Assigned to the work request
  );

-- Audit Logging (Conceptual - requires database triggers or application-level logging)
-- For Supabase, you would typically use database triggers to log changes to a separate audit table.
-- Example for a simple audit trigger on 'tenant_users' table:

-- CREATE TABLE public.audit_logs (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   table_name TEXT NOT NULL,
--   record_id TEXT NOT NULL,
--   operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
--   old_data JSONB,
--   new_data JSONB,
--   changed_by UUID REFERENCES auth.users(id),
--   changed_at TIMESTAMPTZ DEFAULT now()
-- );

-- CREATE OR REPLACE FUNCTION audit_tenant_users_changes() RETURNS TRIGGER AS $$
-- BEGIN
--   IF (TG_OP = 'INSERT') THEN
--     INSERT INTO public.audit_logs (table_name, record_id, operation, new_data, changed_by)
--     VALUES ('tenant_users', NEW.id::TEXT, 'INSERT', to_jsonb(NEW), auth.uid());
--     RETURN NEW;
--   ELSIF (TG_OP = 'UPDATE') THEN
--     INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
--     VALUES ('tenant_users', NEW.id::TEXT, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
--     RETURN NEW;
--   ELSIF (TG_OP = 'DELETE') THEN
--     INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, changed_by)
--     VALUES ('tenant_users', OLD.id::TEXT, 'DELETE', to_jsonb(OLD), auth.uid());
--     RETURN OLD;
--   END IF;
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER audit_tenant_users
-- AFTER INSERT OR UPDATE OR DELETE ON public.tenant_users
-- FOR EACH ROW EXECUTE FUNCTION audit_tenant_users_changes();

-- Note: For audit logging, ensure the `audit_logs` table has appropriate RLS policies as well
-- to prevent unauthorized access to audit data. Typically, only host_admin or a dedicated audit role
-- should have access to read audit logs.
