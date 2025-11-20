-- Fix handle_new_user() function to create tenant_users BEFORE customers
-- This ensures is_tenant_member() returns true when inserting into customers table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    default_tenant_id UUID;
    user_email TEXT;
    user_name TEXT;
    company_domain TEXT;
    existing_tenant_id UUID;
    name_parts TEXT[];
    last_name TEXT;
BEGIN
    -- Get user details
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 
                         NEW.raw_user_meta_data->>'name', 
                         split_part(user_email, '@', 1));
    
    -- Extract company domain from email
    company_domain := split_part(user_email, '@', 2);
    
    -- Parse name parts
    name_parts := string_to_array(user_name, ' ');
    IF array_length(name_parts, 1) > 1 THEN
        last_name := array_to_string(name_parts[2:array_length(name_parts,1)], ' ');
    ELSE
        last_name := '';
    END IF;
    
    -- Check if a tenant already exists for this domain
    SELECT id INTO existing_tenant_id 
    FROM tenants 
    WHERE domain = company_domain 
    LIMIT 1;
    
    IF existing_tenant_id IS NOT NULL THEN
        -- Use existing tenant
        default_tenant_id := existing_tenant_id;
    ELSE
        -- Create new tenant for this company domain
        INSERT INTO tenants (
            id, name, slug, domain, status, subscription_tier, max_employees, created_at, updated_at, created_by
        ) VALUES (
            gen_random_uuid(),
            CASE 
                WHEN company_domain IN ('gmail.com', 'yahoo.com', 'hotmail.com') 
                THEN 'Individual User (' || split_part(user_email, '@', 1) || ')'
                ELSE initcap(replace(split_part(company_domain, '.', 1), '-', ' ')) || ' Company'
            END,
            CASE 
                WHEN company_domain IN ('gmail.com', 'yahoo.com', 'hotmail.com') 
                THEN 'individual-' || split_part(user_email, '@', 1)
                ELSE replace(split_part(company_domain, '.', 1), '.', '-')
            END,
            company_domain, 'active', 'basic', 100, NOW(), NOW(), NEW.id
        ) RETURNING id INTO default_tenant_id;
    END IF;
    
    -- Create profile record
    INSERT INTO public.profiles (
        id, full_name, department, job_title, created_at, updated_at
    ) VALUES (
        NEW.id, user_name, 'General', 'Employee', NOW(), NOW()
    );
    
    -- ✅ FIX: Create tenant_user association FIRST (before customers)
    -- This ensures is_tenant_member() returns true for subsequent inserts
    INSERT INTO public.tenant_users (
        id, tenant_id, user_id, role, permissions, is_active, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), default_tenant_id, NEW.id,
        CASE WHEN existing_tenant_id IS NULL THEN 'admin' ELSE 'user' END,
        CASE 
            WHEN existing_tenant_id IS NULL 
            THEN '{"manage_users": true, "manage_requests": true, "view_all_requests": true}'::jsonb
            ELSE '{"create_requests": true, "view_own_requests": true}'::jsonb
        END,
        true, NOW(), NOW()
    );
    
    -- Now create customer record (user is now a tenant member, so RLS allows insert)
    INSERT INTO public.customers (
        id, email, first_name, last_name, company_name, tenant_id, status, created_at, updated_at, created_by
    ) VALUES (
        NEW.id,
        user_email,
        name_parts[1],
        last_name,
        CASE 
            WHEN company_domain IN ('gmail.com', 'yahoo.com', 'hotmail.com') 
            THEN 'Individual'
            ELSE initcap(replace(split_part(company_domain, '.', 1), '-', ' '))
        END,
        default_tenant_id, 'active', NOW(), NOW(), NEW.id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.email, SQLERRM;
        -- Don't fail the user creation, just log the error
        RETURN NEW;
END;
$function$;

-- Add comment explaining the fix
COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function that creates associated records when a new user signs up.
IMPORTANT: tenant_users must be created BEFORE customers to satisfy RLS policy is_tenant_member().
Fixed: 2025-11-20 - Reordered inserts to prevent "Database error granting user" error.';
