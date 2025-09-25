# ETLA Platform Development: Project Breakdown & Delivery Plan

## Overview
Based on the requirements analysis, this project will be delivered in 6 strategic phases using separate Git branches to avoid disruption to the main branch. Each deliverable will be thoroughly tested before merging.

## Development Strategy

### Branch Naming Convention
- `feature/reporting-enhancements` - Reporting improvements
- `feature/database-schema-discovery` - Database analysis and schema work
- `feature/ats-core-module` - Applicant Tracking System core
- `feature/questionnaire-system` - ROM Questionnaire system
- `feature/rbac-security-enhancements` - Security and permissions
- `feature/integration-testing` - Final integration and testing

### Git Workflow
1. Create feature branch from main
2. Develop and test locally
3. Push to GitHub for Vercel testing
4. Merge to main after successful testing

## Phase 1: Database Schema Discovery & Analysis
**Branch:** `feature/database-schema-discovery`
**Duration:** 1-2 days

### Objectives
- Perform comprehensive discovery of existing Supabase schema
- Document current tables, relationships, and constraints
- Identify reusable components vs. new requirements
- Create migration scripts only where necessary

### Deliverables
1. **Database Discovery Report** (`database/schema_discovery_report.md`)
   - Complete table inventory with columns, constraints, RLS policies
   - Relationship mapping
   - Gap analysis for ATS and Questionnaire requirements

2. **Schema Migration Scripts** (`database/migrations/`)
   - Only create new tables if extension isn't viable
   - RLS policies for new tables
   - Indexes for performance

3. **Data Validation Scripts** (`database/validation/`)
   - Integrity checks
   - Performance validation

### Key Tasks
- [ ] Audit existing tables: work_requests, documents, notes, email_templates, activity_log
- [ ] Check for candidate/applicant, job/requisition related tables
- [ ] Analyze timecard detail tables for grid requirements
- [ ] Verify tax fields for local tax display
- [ ] Document RLS policies and RBAC structure

## Phase 2: Reporting Enhancements
**Branch:** `feature/reporting-enhancements`
**Duration:** 2-3 days

### Objectives
- Implement branding swap to Customer's Legal Name
- Add Timecards grid with daily breakdown
- Enhance Tax Records with local tax display
- Create Employee Documents list with RBAC

### Deliverables
1. **Enhanced Reporting Components** (`src/app/reporting/`)
   - Updated Pay Statements detail page
   - New Timecards grid component with export
   - Enhanced Tax Records with local tax display
   - Employee Documents list with preview/download

2. **Branding Service** (`src/services/brandingService.ts`)
   - Dynamic customer name resolution
   - Multi-tenant branding support

3. **Export Utilities** (`src/utils/exportUtils.ts`)
   - CSV/XLSX export for timecards grid
   - Consistent export formatting

### Key Tasks
- [ ] Replace "HelixBridge" with dynamic Customer Legal Name
- [ ] Build timecards daily grid with totals calculation
- [ ] Add local tax fields display in Tax Records
- [ ] Implement Employee Documents with RBAC filtering
- [ ] Add export functionality for timecards

## Phase 3: ATS Core Module
**Branch:** `feature/ats-core-module`
**Duration:** 4-5 days

### Objectives
- Create complete Applicant Tracking System
- Implement Talent navigation and core workflows
- Build Kanban pipeline with drag-drop functionality

### Deliverables
1. **Talent Module Structure** (`src/app/talent/`)
   ```
   /talent/
   ├── dashboard/
   ├── jobs/
   ├── pipeline/[jobId]/
   ├── candidates/
   ├── interviews/
   ├── offers/
   ├── reports/
   └── settings/
   ```

2. **ATS Services** (`src/services/ats/`)
   - JobsService
   - CandidatesService
   - ApplicationsService
   - InterviewsService
   - OffersService

3. **ATS Components** (`src/components/ats/`)
   - Kanban pipeline with drag-drop
   - Candidate profile tabs
   - Interview scheduler
   - Offer management workflow

### Key Tasks
- [ ] Create Talent navigation group
- [ ] Build Jobs management (create/edit/list)
- [ ] Implement Kanban pipeline with stage management
- [ ] Create Candidates directory and profile system
- [ ] Build Interview scheduling and feedback system
- [ ] Implement Offers workflow with approvals
- [ ] Add ATS reporting and analytics
- [ ] Create ATS settings and configuration

## Phase 4: ROM Questionnaire System
**Branch:** `feature/questionnaire-system`
**Duration:** 3-4 days

### Objectives
- Build JSON-driven questionnaire renderer
- Implement scoring and conditional logic engine
- Integrate with Work Requests workflow

### Deliverables
1. **Questionnaire Engine** (`src/services/questionnaire/`)
   - JSON template processor
   - Dynamic form renderer
   - Scoring and logic engine
   - PDF/JSON artifact generation

2. **Work Request Integration** (`src/app/work-requests/`)
   - Questionnaire step in workflow
   - Status tracking and progress saving
   - Results display and export

3. **Template Management** (`src/app/admin/questionnaires/`)
   - Template versioning
   - Activation/deactivation
   - Preview functionality

### Key Tasks
- [ ] Create JSON-driven form renderer
- [ ] Implement conditional logic engine
- [ ] Build scoring calculation system
- [ ] Add Work Request questionnaire integration
- [ ] Create PDF/JSON artifact generation
- [ ] Build template management interface
- [ ] Add progress saving and validation

## Phase 5: RBAC & Security Enhancements
**Branch:** `feature/rbac-security-enhancements`
**Duration:** 2-3 days

### Objectives
- Extend RBAC system for new features
- Implement route and component guards
- Enhance RLS policies

### Deliverables
1. **Enhanced RBAC System** (`src/lib/rbac/`)
   - New feature permissions (ATS, Questionnaires)
   - Role-based component guards
   - Service-layer permission checks

2. **Security Middleware** (`src/middleware/`)
   - Route protection
   - Feature access validation
   - Tenant isolation enforcement

3. **RLS Policy Updates** (`database/rls/`)
   - Policies for new ATS tables
   - Questionnaire data protection
   - Admin bypass mechanisms

### Key Tasks
- [ ] Add FEATURES.APPLICANT_TRACKING and FEATURES.QUESTIONNAIRES
- [ ] Implement role-based route guards
- [ ] Create component-level permission checks
- [ ] Update RLS policies for new tables
- [ ] Add service-layer security validation

## Phase 6: Integration Testing & Deployment
**Branch:** `feature/integration-testing`
**Duration:** 2-3 days

### Objectives
- Comprehensive end-to-end testing
- Performance optimization
- Final integration validation

### Deliverables
1. **Test Suites** (`tests/`)
   - Unit tests for services
   - Integration tests for workflows
   - E2E tests for critical paths

2. **Performance Optimization**
   - Query optimization
   - Component lazy loading
   - Caching strategies

3. **Deployment Documentation**
   - Environment setup
   - Migration procedures
   - Rollback plans

### Key Tasks
- [ ] Create comprehensive test coverage
- [ ] Validate all user stories and acceptance criteria
- [ ] Performance testing and optimization
- [ ] Security audit and validation
- [ ] Documentation and deployment guides

## Risk Mitigation Strategies

### Schema Conflicts
- **Risk:** Existing tables may conflict with new requirements
- **Mitigation:** Comprehensive discovery phase first, extend rather than create new

### Performance Impact
- **Risk:** New features may impact existing performance
- **Mitigation:** Incremental testing, performance monitoring, query optimization

### Data Integrity
- **Risk:** Schema changes may affect existing data
- **Mitigation:** Thorough validation scripts, backup procedures, rollback plans

### Security Vulnerabilities
- **Risk:** New features may introduce security gaps
- **Mitigation:** RBAC-first development, comprehensive RLS policies, security audits

## Success Metrics

### Technical Metrics
- All existing functionality remains intact
- New features pass acceptance criteria
- Performance benchmarks maintained
- Security audit passes
- Test coverage > 80%

### Business Metrics
- Complete ATS workflow functional
- ROM questionnaire scoring accurate
- Reporting enhancements working
- RBAC properly enforced
- Multi-tenant isolation maintained

## Next Steps

1. **Immediate:** Start with Phase 1 (Database Discovery)
2. **Week 1:** Complete Phases 1-2 (Discovery + Reporting)
3. **Week 2:** Complete Phases 3-4 (ATS + Questionnaires)
4. **Week 3:** Complete Phases 5-6 (Security + Integration)

Each phase will be developed in its own branch, tested thoroughly, and merged only after successful validation in Vercel.
