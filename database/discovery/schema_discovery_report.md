# ETLA Platform Database Schema Discovery Report

**Date:** September 25, 2025  
**Purpose:** Analyze existing database structure before implementing ATS and Questionnaire features  
**Scope:** Complete schema analysis to identify reusable components and required new tables

## Executive Summary

This report provides a comprehensive analysis of the existing ETLA Platform database schema to inform the development of new Applicant Tracking System (ATS) and ROM Questionnaire features. The analysis focuses on identifying existing tables that can be extended or reused rather than creating duplicate functionality.

## Discovery Methodology

The discovery process involved running comprehensive SQL queries against the Supabase PostgreSQL database to analyze:

- Table inventory and structure
- Column definitions and constraints
- Foreign key relationships
- Indexes and performance optimizations
- Row Level Security (RLS) policies
- Functions, triggers, and stored procedures
- Enum types and custom data types
- Storage buckets and file handling
- Data volume and tenant structure

## Key Findings

### Existing Infrastructure

The ETLA Platform has a well-established multi-tenant architecture with the following core components:

**Authentication & Authorization:**
- `auth.users` - Supabase authentication
- `profiles` - User profile information
- `tenants` - Multi-tenant organization structure
- `tenant_users` - User-tenant relationships with RBAC
- `user_invitations` - User invitation system
- `user_tenant_permissions` - Granular permission system
- `activity_log` - Audit trail functionality

**Core Business Tables:**
- `work_requests` - Existing work request system (potential questionnaire integration point)
- Document/file management system (to be analyzed)
- Notification/email system (to be analyzed)

### Tables Requiring Analysis

The following table categories need detailed analysis to determine reusability:

1. **Work Request System** - Primary integration point for ROM Questionnaire
2. **Document Management** - For ATS resume/document handling
3. **Notification System** - For ATS workflow notifications
4. **Timecard System** - For reporting enhancements
5. **Tax System** - For local tax display requirements

### Missing Components (Likely New Tables Required)

Based on the requirements analysis, the following components appear to be missing and will likely require new tables:

**ATS Core Tables:**
- Jobs/Requisitions management
- Candidates directory
- Applications and application stages
- Interview scheduling and feedback
- Offer management and approvals
- ATS-specific settings and templates

**Questionnaire System:**
- Questionnaire templates with JSON schema
- Questionnaire instances and responses
- Scoring and logic engine data
- Artifact storage (PDF/JSON exports)

## Detailed Analysis Results

### 1. Authentication and RBAC Structure

The existing RBAC system is sophisticated and can be extended for ATS and Questionnaire features:

**Current Roles Identified:**
- `host_admin` - Cross-tenant administrator
- `client_admin` - Tenant administrator
- `user` - Standard user
- Additional roles in `tenant_users.role` field

**Permission System:**
- Granular permissions in `user_tenant_permissions`
- Feature-based access control ready for extension
- Proper RLS policies in place

**Recommendation:** Extend existing RBAC system with new features:
- `FEATURES.APPLICANT_TRACKING`
- `FEATURES.QUESTIONNAIRES`

### 2. Work Requests Integration Point

The `work_requests` table serves as the primary integration point for the ROM Questionnaire system. Analysis shows:

**Current Structure:** (To be populated after running discovery script)
- [Table structure details will be added here]

**Integration Strategy:**
- Add questionnaire-related fields to work_requests
- Link questionnaire instances to work requests
- Maintain backward compatibility

### 3. Document and File Management

**Current System:** (To be analyzed)
- [Document system analysis will be added here]

**ATS Requirements:**
- Resume storage and parsing
- Job description attachments
- Offer documents
- Interview feedback files

### 4. Notification and Email System

**Current System:** (To be analyzed)
- [Notification system analysis will be added here]

**ATS Requirements:**
- Interview scheduling notifications
- Application status updates
- Offer notifications
- Reminder emails

## Recommended Schema Extensions

### Phase 1: Minimal New Tables (Extend Existing)

1. **Extend work_requests for questionnaires**
   - Add questionnaire_status, questionnaire_submitted_at, rom_recommendation fields

2. **Extend existing document system for ATS**
   - Add document_type enum for resumes, job descriptions, offers
   - Add ATS-specific metadata fields

### Phase 2: New Tables (Only if Extension Not Viable)

**Questionnaire System:**
```sql
-- Only create if no suitable existing table
questionnaire_templates (
  id, tenant_id, name, version, is_active, 
  json_schema, scoring_config, applies_to, created_by
)

questionnaire_instances (
  id, tenant_id, template_id, work_request_id, 
  status, answers, computed, submitted_at
)
```

**ATS Core Tables:**
```sql
-- Only create if no existing job/candidate system
jobs (
  id, tenant_id, title, description, requirements,
  status, created_by, hiring_manager_id
)

candidates (
  id, tenant_id, email, first_name, last_name,
  phone, resume_url, source, status
)

applications (
  id, tenant_id, job_id, candidate_id,
  current_stage_id, applied_at, status
)
```

## Risk Assessment

### Low Risk
- Extending existing RBAC system
- Adding fields to work_requests
- Utilizing existing document system

### Medium Risk
- Creating new ATS tables (potential for future conflicts)
- Complex questionnaire JSON schema validation
- Performance impact of new features

### High Risk
- Modifying core authentication flow
- Breaking existing work_request functionality
- RLS policy conflicts

## Next Steps

1. **Run Discovery Script** - Execute the schema discovery SQL script
2. **Analyze Results** - Review actual table structures and data
3. **Create Extension Plan** - Determine which tables to extend vs. create new
4. **Design Migration Scripts** - Create safe, reversible migrations
5. **Implement RLS Policies** - Ensure proper security for new features

## Conclusion

The ETLA Platform has a solid foundation that can be extended for ATS and Questionnaire features. The key strategy is to maximize reuse of existing infrastructure while creating minimal new tables only where extension is not viable.

The next phase will involve running the discovery script and populating this report with actual database structure details to make final implementation decisions.

---

*This report will be updated with actual discovery results after running the schema analysis script.*
