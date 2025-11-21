# Supabase Migrations - ETL Configuration Management System

## 📁 Files in This Directory

### **1. `20251121_create_etl_config_tables.sql`**
**Main migration script** that creates the complete database schema for the ETL Configuration Management System.

**What it creates:**
- ✅ 6 tables (integration_configs, integration_credentials, integration_sync_configs, integration_sync_history, integration_audit_log, integration_types)
- ✅ 2 extensions (pgcrypto, uuid-ossp)
- ✅ 4 functions (encrypt_credential, decrypt_credential, log_integration_audit, update_updated_at_column)
- ✅ 15+ RLS policies for security
- ✅ 15+ indexes for performance
- ✅ 3 triggers for automatic timestamp updates
- ✅ Seed data for 10 integration types (Paycom, ADP, Workday, etc.)

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire file contents
3. Click "Run" or press Ctrl+Enter

**Estimated execution time:** 2-5 seconds

---

### **2. `20251121_verify_etl_setup.sql`**
**Verification script** that checks if the migration was successful.

**What it checks:**
- ✅ All tables exist
- ✅ Extensions are enabled
- ✅ Functions are created
- ✅ Encryption/decryption works
- ✅ RLS is enabled on all tables
- ✅ Indexes are created
- ✅ Triggers are set up
- ✅ Seed data is inserted
- ✅ Foreign keys and constraints exist

**How to run:**
1. After running the main migration
2. Open Supabase SQL Editor
3. Copy and paste the entire file contents
4. Click "Run" or press Ctrl+Enter

**Expected output:** All checks should show ✅ PASS

---

## 🚀 Quick Start Guide

### **Step 1: Run the Migration**

```bash
# Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy/paste: supabase/migrations/20251121_create_etl_config_tables.sql
5. Click "Run"
```

```bash
# Option B: Via Supabase CLI (if installed)
supabase db push
```

### **Step 2: Verify the Setup**

```bash
# Run verification script
1. Open SQL Editor
2. Copy/paste: supabase/migrations/20251121_verify_etl_setup.sql
3. Click "Run"
4. Check that all results show ✅ PASS
```

### **Step 3: Set Encryption Key (Production Only)**

```sql
-- Generate a secure key
SELECT encode(gen_random_bytes(32), 'base64');

-- Set it in Project Settings → Database → Custom Postgres Configuration
-- app.encryption_key = 'your-generated-key-here'
```

---

## 📊 Database Schema Overview

### **Table Relationships**

```
tenants
  └── integration_configs (tenant_id)
        ├── integration_credentials (integration_config_id)
        ├── integration_sync_configs (integration_config_id)
        ├── integration_sync_history (integration_config_id)
        └── integration_audit_log (integration_config_id)

users
  ├── integration_configs (created_by, updated_by)
  ├── integration_credentials (accessed_by)
  ├── integration_sync_history (triggered_by_user)
  └── integration_audit_log (user_id)

integration_types (reference table)
```

### **Security Model**

- **Row Level Security (RLS)** enabled on all tables
- **Tenant isolation**: Users can only access data for their tenant
- **Role-based access**:
  - `host_admin`: Full access to all tenants
  - `client_admin`: Full access to their tenant
  - `client_user`: Read-only access to their tenant
- **Credential protection**: Only admins can view/modify credentials
- **Audit logging**: All changes are logged for compliance

### **Encryption**

- **Algorithm**: AES-256 (via pgcrypto)
- **Encrypted fields**:
  - Usernames (e.g., Paycom SID)
  - Passwords/Tokens (e.g., Paycom Token)
  - API Keys
  - OAuth credentials
  - SFTP private keys
- **Key management**: Stored in Postgres configuration (not in database)

---

## 🔧 Maintenance

### **Adding a New Integration Type**

```sql
INSERT INTO integration_types (id, display_name, category, description, sort_order)
VALUES ('new_system', 'New System', 'hris', 'Description here', 11);
```

### **Rotating Encryption Key**

⚠️ **WARNING**: Rotating the encryption key will make existing encrypted data unreadable!

**Safe rotation process:**
1. Decrypt all existing credentials with old key
2. Set new encryption key
3. Re-encrypt all credentials with new key

```sql
-- This requires a custom migration script
-- Contact support for assistance
```

### **Backing Up Credentials**

```sql
-- Export decrypted credentials (ADMIN ONLY)
SELECT 
  ic.integration_name,
  ic.integration_type,
  decrypt_credential(icr.encrypted_username) as username,
  decrypt_credential(icr.encrypted_password) as password
FROM integration_credentials icr
JOIN integration_configs ic ON ic.id = icr.integration_config_id
WHERE ic.tenant_id = '<your-tenant-id>';

-- Save output to secure location (e.g., password manager)
```

### **Cleaning Up Old Sync History**

```sql
-- Delete sync history older than 90 days
DELETE FROM integration_sync_history
WHERE sync_started_at < NOW() - INTERVAL '90 days';

-- Or archive to a separate table first
CREATE TABLE integration_sync_history_archive AS
SELECT * FROM integration_sync_history
WHERE sync_started_at < NOW() - INTERVAL '90 days';

DELETE FROM integration_sync_history
WHERE id IN (SELECT id FROM integration_sync_history_archive);
```

---

## 📝 Migration History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2025-11-21 | Initial schema creation for ETL Configuration Management System |

---

## 🐛 Troubleshooting

### **Error: "relation already exists"**

**Solution**: Tables were already created. Either skip the migration or drop existing tables first.

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'integration%';

-- Drop tables if needed (⚠️ WARNING: DESTRUCTIVE!)
DROP TABLE IF EXISTS integration_audit_log CASCADE;
DROP TABLE IF EXISTS integration_sync_history CASCADE;
DROP TABLE IF EXISTS integration_sync_configs CASCADE;
DROP TABLE IF EXISTS integration_credentials CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_types CASCADE;
```

### **Error: "permission denied"**

**Solution**: Make sure you're logged in as the project owner or have admin privileges.

### **Error: "extension does not exist"**

**Solution**: Enable the required extensions manually.

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Encryption returns NULL**

**Solution**: Set the encryption key in Postgres configuration.

```sql
-- Check if key is set
SELECT current_setting('app.encryption_key', true);

-- If NULL, set it in Project Settings → Database → Custom Postgres Configuration
```

---

## 📚 Additional Resources

- [Setup Instructions](../SETUP_INSTRUCTIONS.md) - Detailed step-by-step guide
- [Paycom API Analysis](../../paycom_api_analysis.md) - Paycom integration details
- [ETL Enhancement Proposal](../../ETL_CONFIG_FINAL_PROPOSAL.md) - Full project proposal
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)

---

## 🤝 Contributing

When adding new migrations:

1. **Naming convention**: `YYYYMMDD_description.sql`
2. **Include rollback**: Add a corresponding `_rollback.sql` file
3. **Test thoroughly**: Test in development before production
4. **Document changes**: Update this README with migration details
5. **Version control**: Commit migrations to Git

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Run the verification script to identify problems
3. Review Supabase logs: **Project Settings** → **Logs** → **Postgres Logs**
4. Contact the development team

---

**Last Updated**: 2025-11-21  
**Maintained By**: HelixBridge Development Team
