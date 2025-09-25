# ETLA Platform - Complete Testing Requirements

## Overview
This document outlines comprehensive testing requirements for all implemented features. Each feature should be accessible and functional on the deployed Vercel instance.

---

## 🔍 **PHASE 1: Database Schema Discovery**
**Branch:** `feature/database-schema-discovery`
**Status:** Needs Verification

### Testing Requirements:
- [ ] **Database Discovery Scripts Available**
  - Navigate to `/database/discovery/` folder
  - Verify `schema_discovery.sql` exists and is executable
  - Confirm `schema_discovery_report.md` template is present

### Expected Vercel Behavior:
- [ ] No UI changes expected (backend scripts only)
- [ ] Build should complete successfully
- [ ] No broken links or errors

---

## 📊 **PHASE 2: Reporting Enhancements**
**Branch:** `feature/complete-reporting-enhancements`
**Status:** Needs UI Verification

### Critical Testing Requirements:

#### **REP-01: Dynamic Customer Branding** 🏢
- [ ] **Facsimile Documents Show Customer Name**
  - Navigate to any employee's pay statement detail
  - Verify header shows customer legal name (NOT "HelixBridge")
  - Check footer copyright shows customer name
  - Test across different tenants

- [ ] **Branding Service Integration**
  - Verify `BrandingService` resolves customer names correctly
  - Test fallback to "ETLA Platform" when customer name unavailable
  - Confirm multi-tenant support works

#### **REP-02: Enhanced Timecards Grid** 📅
- [ ] **Grid-Style Timecard Display**
  - Navigate to employee timecard details
  - Verify daily breakdown table shows:
    - Work Date column
    - Clock In time (AM/PM format)
    - Clock Out time (AM/PM format)  
    - Regular Hours calculated
    - OT Hours calculated
    - Total Hours calculated
  - Confirm "Pay Period Totals" row at bottom
  - Test with blank/missing days

- [ ] **Export Functionality**
  - Click "Export to CSV" button
  - Verify CSV downloads with proper data
  - Click "Export to Excel" button  
  - Verify XLSX downloads with formatting
  - Confirm customer branding in export headers

#### **REP-03: Local Tax Display** 🏛️
- [ ] **Tax Records Enhancement**
  - Navigate to employee tax records
  - Verify "Local Tax Information" section exists
  - Confirm `local_tax_withheld` amount displays (or "None")
  - Confirm `local_tax_jurisdiction` displays (or "None")
  - Test with employees who have/don't have local taxes

#### **REP-04: Employee Documents** 📄
- [ ] **Document List View**
  - Navigate to employee documents section
  - Verify filterable list with search functionality
  - Confirm document type filtering works
  - Test date range filtering

- [ ] **Preview/Download Functionality**
  - Click document preview button
  - Verify PDF/image preview opens
  - Click download button
  - Confirm file downloads successfully
  - Test RBAC enforcement (different user roles see different documents)

- [ ] **RBAC Integration**
  - Test as Admin: Should see all documents
  - Test as HR: Should see HR-related documents
  - Test as Manager: Should see team documents only
  - Test as Employee: Should see own documents only

### Expected Vercel Behavior:
- [ ] All reporting pages load without errors
- [ ] Customer names display correctly (not HelixBridge)
- [ ] Grid-style timecards render properly
- [ ] Export buttons function and download files
- [ ] Local tax information displays correctly
- [ ] Document preview/download works

---

## 👥 **PHASE 3-4: ATS Core Module**
**Branch:** `feature/ats-core-module`
**Status:** Needs Complete UI Verification

### Navigation Requirements:
- [ ] **Talent Menu Available**
  - Verify "Talent" appears in main navigation
  - Confirm dropdown/submenu shows ATS options

### **ATS-01: Talent Dashboard** 🎯
**URL:** `/talent`
- [ ] **Dashboard Loads Successfully**
  - Navigate to `/talent`
  - Verify page loads without errors
  - Confirm metrics cards display
  - Check recent activity feed works

- [ ] **Quick Actions Functional**
  - Test "Post New Job" button
  - Test "Add Candidate" button
  - Test "Schedule Interview" button
  - Verify navigation to respective pages

### **ATS-02: Jobs Management** 💼
**URL:** `/talent/jobs`
- [ ] **Jobs List Display**
  - Navigate to `/talent/jobs`
  - Verify jobs table loads with sample data
  - Confirm filtering by status works
  - Test search functionality

- [ ] **Job Creation/Editing**
  - Click "Create Job" button
  - Verify job creation form opens
  - Test form validation
  - Confirm job saves successfully

### **ATS-03: Pipeline/Kanban** 📋
**URL:** `/talent/pipeline`
- [ ] **Kanban Board Display**
  - Navigate to `/talent/pipeline`
  - Verify columns show: Applied, Screening, Interview, Offer, Hired
  - Confirm candidate cards display in columns
  - Test drag-and-drop functionality between stages

- [ ] **Application Management**
  - Test moving candidates between stages
  - Verify stage change updates persist
  - Confirm candidate details accessible

### **ATS-04: Candidates Management** 👤
**URL:** `/talent/candidates`
- [ ] **Candidate Directory**
  - Navigate to `/talent/candidates`
  - Verify candidate list displays
  - Test search and filtering
  - Confirm candidate profiles accessible

- [ ] **Candidate Profiles**
  - Click on candidate name
  - Verify profile page loads
  - Confirm resume/documents display
  - Test contact information accuracy

### **ATS-05: Interview Scheduling** 📅
**URL:** `/talent/interviews`
- [ ] **Interview Calendar**
  - Navigate to `/talent/interviews`
  - Verify calendar view displays
  - Confirm scheduled interviews show
  - Test calendar navigation (month/week/day views)

- [ ] **Interview Management**
  - Click "Schedule Interview" button
  - Verify scheduling form opens
  - Test calendar integration
  - Confirm interview saves and appears on calendar

### **ATS-06: Offers Management** 💰
**URL:** `/talent/offers`
- [ ] **Offers Dashboard**
  - Navigate to `/talent/offers`
  - Verify offers list displays
  - Confirm status tracking works
  - Test filtering by offer status

- [ ] **Offer Workflow**
  - Click "Create Offer" button
  - Verify offer creation form
  - Test approval workflow
  - Confirm offer generation and sending

### Expected Vercel Behavior:
- [ ] All ATS pages accessible via navigation
- [ ] No 404 errors on any ATS routes
- [ ] All components render without console errors
- [ ] Interactive features (drag-drop, forms) work
- [ ] Data persists between page refreshes

---

## 📝 **PHASE 5: ROM Questionnaire System**
**Branch:** `feature/rom-questionnaire-system`
**Status:** Needs Complete UI Verification

### Navigation Requirements:
- [ ] **Questionnaires Menu Available**
  - Verify "Questionnaires" appears in main navigation
  - Confirm access to questionnaire features

### **QUEST-01: Questionnaire Dashboard** 📊
**URL:** `/questionnaires`
- [ ] **Dashboard Loads Successfully**
  - Navigate to `/questionnaires`
  - Verify page loads without errors
  - Confirm questionnaire list displays
  - Check status badges work correctly

- [ ] **Questionnaire Management**
  - Test filtering by status (Draft, Active, Paused)
  - Verify search functionality
  - Confirm bulk operations work
  - Test questionnaire creation button

### **QUEST-02: Questionnaire Builder** 🔧
**URL:** `/questionnaires/builder`
- [ ] **Builder Interface**
  - Navigate to `/questionnaires/builder`
  - Verify drag-and-drop question builder loads
  - Confirm question type selector works
  - Test question preview functionality

- [ ] **Question Types Support**
  - Test Text input questions
  - Test Textarea questions
  - Test Single choice (radio) questions
  - Test Multiple choice (checkbox) questions
  - Test Rating (star) questions
  - Test Number input questions
  - Test Date picker questions
  - Test Email validation questions

- [ ] **Builder Features**
  - Test drag-and-drop question reordering
  - Verify question validation settings
  - Confirm questionnaire settings (time limits, etc.)
  - Test save/publish functionality

### **QUEST-03: Response Collection** 📝
**URL:** `/questionnaires/respond/[id]`
- [ ] **Response Interface**
  - Navigate to a questionnaire response URL
  - Verify questionnaire loads correctly
  - Confirm progress bar displays
  - Test question navigation (Next/Previous)

- [ ] **Response Features**
  - Test all question type inputs work
  - Verify validation errors display
  - Confirm required field enforcement
  - Test time limit countdown (if enabled)
  - Verify submission success page

### **QUEST-04: Analytics Dashboard** 📈
**URL:** `/questionnaires/analytics/[id]`
- [ ] **Analytics Display**
  - Navigate to questionnaire analytics
  - Verify overview metrics display
  - Confirm response charts render
  - Test demographic breakdowns

- [ ] **Export Functionality**
  - Test "Export Data" CSV download
  - Test "Export Summary" report download
  - Verify data accuracy in exports
  - Confirm proper file naming

### Expected Vercel Behavior:
- [ ] All questionnaire pages accessible
- [ ] Builder interface fully functional
- [ ] Response collection works end-to-end
- [ ] Analytics display correctly
- [ ] Export functionality works

---

## 🔐 **INTEGRATION TESTING REQUIREMENTS**

### **Cross-Module Integration**
- [ ] **Navigation Between Modules**
  - Test navigation from Reporting to ATS
  - Test navigation from ATS to Questionnaires
  - Verify breadcrumbs work correctly
  - Confirm user context maintained

- [ ] **Data Consistency**
  - Verify employee data consistent across modules
  - Test tenant isolation works properly
  - Confirm RBAC applies across all modules

### **Performance Testing**
- [ ] **Page Load Times**
  - All pages load within 3 seconds
  - No console errors on any page
  - Responsive design works on mobile/tablet

- [ ] **Build Verification**
  - All branches build successfully on Vercel
  - No TypeScript compilation errors
  - No broken imports or missing dependencies

---

## 🚨 **CRITICAL ISSUES TO VERIFY**

### **Immediate Verification Needed:**
1. **Are ATS pages accessible?** Check if `/talent` routes exist in navigation
2. **Are Questionnaire pages accessible?** Check if `/questionnaires` routes exist
3. **Do reporting enhancements show?** Verify customer names replace HelixBridge
4. **Are grid-style timecards visible?** Check if daily breakdown tables display
5. **Do export buttons work?** Test CSV/Excel download functionality

### **Navigation Integration:**
- [ ] Main navigation includes all new modules
- [ ] Sidebar/menu shows Talent and Questionnaires sections
- [ ] All routes resolve without 404 errors
- [ ] User permissions properly restrict access

---

## 📋 **TESTING CHECKLIST SUMMARY**

### **Phase 1: Database Discovery** ✅
- Backend scripts only - no UI changes expected

### **Phase 2: Reporting Enhancements** ❓
- [ ] Customer branding replaces HelixBridge
- [ ] Grid-style timecards display
- [ ] Local tax information shows
- [ ] Document preview/download works
- [ ] Export functionality operational

### **Phase 3-4: ATS System** ❓
- [ ] Talent navigation menu exists
- [ ] All 6 ATS pages accessible and functional
- [ ] Kanban drag-drop works
- [ ] Forms and data persistence work

### **Phase 5: Questionnaire System** ❓
- [ ] Questionnaires navigation menu exists
- [ ] All 4 questionnaire pages accessible
- [ ] Builder interface fully functional
- [ ] Response collection works end-to-end
- [ ] Analytics and exports work

### **Integration Testing** ❓
- [ ] Cross-module navigation works
- [ ] Data consistency maintained
- [ ] Performance acceptable
- [ ] No build errors

---

## 🎯 **NEXT STEPS FOR VERIFICATION**

1. **Check Vercel Deployment Status** - Verify which branches are actually deployed
2. **Test Navigation** - Confirm new menu items exist and work
3. **Verify Page Accessibility** - Test all new routes load properly
4. **Functional Testing** - Test core features work as described
5. **Integration Testing** - Verify modules work together
6. **Performance Testing** - Confirm acceptable load times

**Note:** If features are not visible on Vercel, we need to:
1. Check if branches are properly deployed
2. Verify navigation integration
3. Confirm routing is properly configured
4. Test build processes are working
5. Integrate new components into existing navigation structure
