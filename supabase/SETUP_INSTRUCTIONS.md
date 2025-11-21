# ETL Configuration Management System - Setup Instructions

## 📋 Overview

This guide will walk you through setting up the database schema for the ETL Configuration Management System in your Supabase project.

---

## 🚀 Quick Start

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: **Egis Dynamics Llc / Spark**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"+ New Query"**

### **Step 2: Run the Migration Script**

1. Open the migration file: `supabase/migrations/20251121_create_etl_config_tables.sql`
2. Copy the entire contents of the file
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### **Step 3: Verify the Setup**

Run the verification queries (see below) to ensure everything was created successfully.

---

## 📊 What Gets Created

### **Tables (6 total)**

1. **`integration_configs`** - Main configuration table for each integration
   - Stores non-sensitive data like integration type, environment, base URL
   - Tracks connection status and metadata

2. **`integration_credentials`** - Encrypted credentials storage
   - Stores API keys, usernames, passwords, OAuth tokens
   - All sensitive data is encrypted using AES-256

3. **`integration_sync_configs`** - Data synchronization settings
   - Configures which endpoints to sync (employee directory, payroll, etc.)
   - Defines sync frequency, filters, and field mappings

4. **`integration_sync_history`** - Audit trail of sync attempts
   - Tracks every sync operation (success, failure, partial)
   - Records metrics like records synced, duration, errors

5. **`integration_audit_log`** - Comprehensive audit trail
   - Logs all configuration changes for compliance (SOC 2, GDPR)
   - Tracks who made changes, when, and what changed

6. **`integration_types`** - Reference table for supported integrations
   - Pre-populated with Paycom, ADP, Workday, BambooHR, etc.
   - Used by UI for dropdowns and integration selection

### **Functions (4 total)**

1. **`encrypt_credential(TEXT)`** - Encrypts sensitive data
2. **`decrypt_credential(TEXT)`** - Decrypts sensitive data
3. **`log_integration_audit(...)`** - Helper function to log audit events
4. **`update_updated_at_column()`** - Automatically updates `updated_at` timestamps

### **Extensions (2 total)**

1. **`pgcrypto`** - Provides encryption/decryption functions
2. **`uuid-ossp`** - Provides UUID generation functions

### **RLS Policies (15+ total)**

- Row Level Security policies ensure users can only access data for their tenant
- Admins have full access, regular users have read-only access
- Credentials table has the most restrictive policies (admin-only)

### **Indexes (15+ total)**

- Performance indexes on frequently queried columns
- Composite indexes for join operations
- Partial indexes for filtered queries

---

## 🔒 Security Configuration

### **Encryption Key Setup (Important!)**

The migration uses a default encryption key for development. **For production, you MUST set a custom encryption key:**

#### **Option 1: Set via Supabase Dashboard (Recommended)**

1. Go to **Project Settings** → **Database**
2. Scroll to **Custom Postgres Configuration**
3. Add this setting:
   ```
   app.encryption_key = 'your-secure-random-key-here'
   ```
4. Replace `'your-secure-random-key-here'` with a strong random key (32+ characters)
5. Save and restart the database

#### **Option 2: Generate a Secure Key**

Run this in SQL Editor to generate a secure key:

```sql
SELECT encode(gen_random_bytes(32), 'base64');
```

Copy the output and use it as your encryption key.

#### **Option 3: Use Environment Variables (Advanced)**

If you're using Supabase CLI or self-hosting, you can set:

```bash
export SUPABASE_ENCRYPTION_KEY="your-secure-random-key-here"
```

---

## ✅ Verification Queries

Run these queries in the SQL Editor to verify the setup:

### **1. Check if all tables were created**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'integration%'
ORDER BY table_name;
```

**Expected output:** 6 tables
- `integration_audit_log`
- `integration_configs`
- `integration_credentials`
- `integration_sync_configs`
- `integration_sync_history`
- `integration_types`

### **2. Check if extensions are enabled**

```sql
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp');
```

**Expected output:** 2 extensions

### **3. Check if encryption functions exist**

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('encrypt_credential', 'decrypt_credential');
```

**Expected output:** 2 functions

### **4. Test encryption/decryption**

```sql
-- Test encryption
SELECT encrypt_credential('test_password_123');

-- Test decryption (use the output from above)
SELECT decrypt_credential(encrypt_credential('test_password_123'));
```

**Expected output:** Second query should return `'test_password_123'`

### **5. Check if RLS is enabled**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%';
```

**Expected output:** All tables should have `rowsecurity = true`

### **6. Check if integration types were seeded**

```sql
SELECT id, display_name, category 
FROM integration_types 
ORDER BY sort_order;
```

**Expected output:** 10 integration types (Paycom, ADP, Workday, etc.)

### **7. Check if indexes were created**

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
ORDER BY tablename, indexname;
```

**Expected output:** 15+ indexes

---

## 🧪 Test Data (Optional)

If you want to test the setup with sample data, run these queries:

### **Create a test integration config**

```sql
-- Get your tenant ID first
SELECT id, name FROM tenants LIMIT 1;

-- Insert test config (replace <your-tenant-id> with actual tenant ID)
INSERT INTO integration_configs (
  tenant_id,
  integration_type,
  integration_name,
  environment,
  base_url,
  is_active
) VALUES (
  '<your-tenant-id>', -- Replace with your tenant ID
  'paycom',
  'Paycom Sandbox',
  'sandbox',
  'https://api.paycomonline.net/v4/rest/index.php/',
  true
) RETURNING *;
```

### **Create test credentials (encrypted)**

```sql
-- Get the integration config ID from the previous query
-- Replace <integration-config-id> with the actual ID

INSERT INTO integration_credentials (
  integration_config_id,
  credential_type,
  encrypted_username,
  encrypted_password
) VALUES (
  '<integration-config-id>', -- Replace with integration config ID
  'basic_auth',
  encrypt_credential('test_sid_12345'),
  encrypt_credential('test_token_67890')
) RETURNING id, credential_type, created_at;
```

### **Verify encrypted credentials**

```sql
-- View encrypted credentials (only admins can see this)
SELECT 
  id,
  credential_type,
  decrypt_credential(encrypted_username) as username,
  decrypt_credential(encrypted_password) as password,
  created_at
FROM integration_credentials
WHERE integration_config_id = '<integration-config-id>'; -- Replace with integration config ID
```

### **Clean up test data**

```sql
-- Delete test data (this will cascade to credentials)
DELETE FROM integration_configs 
WHERE integration_name = 'Paycom Sandbox';
```

---

## 🔧 Troubleshooting

### **Error: "relation already exists"**

This means the tables were already created. You can either:
- Skip the migration (tables already exist)
- Drop the tables first (⚠️ **WARNING: This will delete all data!**)

```sql
-- Drop all tables (WARNING: DESTRUCTIVE!)
DROP TABLE IF EXISTS integration_audit_log CASCADE;
DROP TABLE IF EXISTS integration_sync_history CASCADE;
DROP TABLE IF EXISTS integration_sync_configs CASCADE;
DROP TABLE IF EXISTS integration_credentials CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_types CASCADE;
```

### **Error: "permission denied"**

Make sure you're logged in as the project owner or have admin privileges.

### **Error: "extension does not exist"**

The `pgcrypto` or `uuid-ossp` extensions might not be enabled. Run:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Error: "function auth.uid() does not exist"**

This means Supabase Auth is not set up. RLS policies require Auth to be configured.

### **Encryption/Decryption returns NULL**

Check if the encryption key is set correctly. See "Encryption Key Setup" section above.

---

## 📝 Next Steps

After running the migration successfully:

1. ✅ **Verify the setup** using the verification queries above
2. ✅ **Set a custom encryption key** for production (see Security Configuration)
3. ✅ **Test with sample data** (optional)
4. ✅ **Start building the UI** for configuration pages
5. ✅ **Implement API routes** for CRUD operations
6. ✅ **Build the Paycom integration** client

---

## 📞 Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review the **Verification Queries** to identify what's missing
3. Check Supabase logs: **Project Settings** → **Logs** → **Postgres Logs**
4. Contact support or review the Supabase documentation

---

## 📚 Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

**Migration Version**: 1.0  
**Date**: 2025-11-21  
**Author**: HelixBridge Development Team
