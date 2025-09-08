// ETLA Platform - Complete Centralized Type Definitions
// Version: 2.0 - ALL Properties Based on Actual Usage Analysis
// This file includes ALL properties actually used in the codebase

// ============================================================================
// BASE ENTITY INTERFACE
// ============================================================================
export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============================================================================
// ENUM TYPES (matching database ENUMs exactly)
// ============================================================================
export type UserRole = 'host_admin' | 'program_manager' | 'client_admin' | 'client_user';
export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type SubscriptionPlan = 'trial' | 'professional' | 'enterprise';
export type RequestStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectStatus = 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high';

// ============================================================================
// CORE ENTITY INTERFACES - COMPLETE WITH ALL USED PROPERTIES
// ============================================================================

export interface WorkRequest extends BaseEntity {
  title: string;
  description: string;
  category?: string;
  priority: PriorityLevel | 'urgent';
  urgency?: UrgencyLevel | 'critical';
  status: RequestStatus | string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_error?: string;
  customer_missing?: boolean;
  requested_by?: string;
  requested_by_name?: string;
  assigned_to?: string;
  due_date?: string;
  required_completion_date?: string;
  submitted_at?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  estimated_budget?: number;
  actual_hours?: number;
  completion_percentage?: number;
  attachments?: string[] | Array<{
    id: string;
    filename: string;
    size: number;
    uploadedAt: string;
    downloadUrl: string;
  }>;
  comments?: string | Array<{
    id: string;
    content: string;
    author: string;
    created_at: string;
  }> | Array<{
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
    isInternal?: boolean;
  }>;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'submitted' | 'under_review' | 'declined' | 'converted_to_project';
  decline_reason?: string;
  approved_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface ProjectCharter extends BaseEntity {
  project_id?: string;
  project_name?: string;
  project_code?: string;
  project_sponsor?: string;
  project_manager?: string;
  title: string;
  description: string;
  objectives?: string[];
  scope?: string;
  deliverables?: string[];
  timeline?: string | {
    start_date: string;
    end_date: string;
    milestones: Array<{
      name: string;
      date: string;
      description: string;
    }>;
  };
  budget: number | {
    total_budget: number;
    labor_cost: number;
    material_cost: number;
    other_costs: number;
  };
  estimated_budget?: number;
  resources_required?: string[];
  risks?: string[];
  success_criteria?: string[];
  stakeholders?: string[] | Array<{
    name: string;
    role: string;
    responsibility: string;
    contact: string;
  }>;
  approval_status?: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  charter_status?: string;
  planned_start_date?: string;
  approved_by?: string;
  approved_at?: string;
  version?: number;
  // Additional properties used in codebase
  assigned_to?: string;
  assignedTo?: string;
  actualCost?: number;
  actualHours?: number;
  attachments?: any[];
  category?: string;
  comments?: any[];
  completedHours?: number;
  completionPercentage?: number;
  customerName?: string;
  endDate?: string;
  estimatedHours?: number;
  hoursAllocated?: number;
  hoursCompleted?: number;
  milestones?: any[];
  nextMilestone?: any;
  priority?: string;
  recentActivity?: any[];
  startDate?: string;
  status?: string;
  timeEntries?: any[];
  unreadComments?: number;
}

export interface Risk extends BaseEntity {
  title: string;
  risk_title?: string;
  risk_code?: string;
  description: string;
  risk_description?: string;
  category?: string;
  risk_category?: string;
  probability: RiskProbability | number | 'very_low' | 'very_high';
  probability_rating?: number;
  impact: RiskImpact | number | 'very_low' | 'very_high';
  impact_rating?: number;
  risk_level?: RiskLevel;
  risk_score?: number;
  status: 'open' | 'mitigated' | 'closed' | string;
  owner?: string;
  risk_owner?: string;
  mitigation_plan?: string;
  contingency_plan?: string;
  identified_date?: string;
  target_resolution_date?: string;
  actual_resolution_date?: string;
  project_id?: string;
  work_request_id?: string;
}

export interface Customer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  contact_person?: string;
  status?: 'active' | 'inactive';
  notes?: string;
}

export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
  profile_image?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  // Employee-specific properties
  employment_status?: 'active' | 'terminated' | 'on_leave';
  home_department?: string;
  flsa_status?: 'exempt' | 'non-exempt';
  union_status?: 'union_member' | 'non_union';
  eeo_categories?: string;
}

export interface PayStatement extends BaseEntity {
  user_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  social_security_tax: number;
  medicare_tax: number;
  other_deductions?: number;
  overtime_hours?: number;
  overtime_pay?: number;
  regular_hours?: number;
  regular_pay?: number;
  department?: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  status: TenantStatus;
  subscription_plan: SubscriptionPlan;
  subscription_start_date: string;
  subscription_end_date?: string;
  max_users: number;
  current_users: number;
  settings: Record<string, any>;
  billing_email?: string;
  billing_address?: string;
}

export interface ProjectMilestone extends BaseEntity {
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_percentage: number;
  dependencies?: string[];
  deliverables?: string[];
  assigned_to?: string;
}

export interface TimeEntry extends BaseEntity {
  user_id: string;
  project_id?: string;
  work_request_id?: string;
  task_description: string;
  hours: number;
  date: string;
  billable: boolean;
  hourly_rate?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

export interface ProjectResource extends BaseEntity {
  project_id: string;
  user_id: string;
  role: string;
  allocation_percentage: number;
  start_date: string;
  end_date?: string;
  hourly_rate?: number;
  status: 'active' | 'inactive';
}

export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface AuditLog extends BaseEntity {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  customerId?: string;
  error?: string;
}

export interface LinkCustomerResponse {
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface WorkRequestApprovalModalProps extends ModalProps {
  workRequest: WorkRequest;
  onApprovalComplete: () => void;
}

export interface MissingCustomerModalProps extends ModalProps {
  workRequestId: string;
  onCustomerCreated: () => void;
}

// ============================================================================
// DASHBOARD DATA INTERFACES
// ============================================================================
export interface DashboardData {
  workRequests: WorkRequest[];
  projectCharters: ProjectCharter[];
  risks: Risk[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// RBAC INTERFACES
// ============================================================================
export interface Permission {
  feature: string;
  permission: string;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// RBAC Matrix Types
export interface RBACPermissionCell {
  permissionId: string;
  resource: string;
  action: string;
  state: 'allow' | 'deny' | 'none';
  origin: 'role' | 'override' | 'none';
  roleNames?: string[];
}

export interface RBACMatrixRowUser {
  userId: string;
  email: string;
  display_name?: string;
  role: string;
  is_active: boolean;
  cells: RBACPermissionCell[];
}

export interface RBACMatrixRowRole {
  roleId: string;
  roleName: string;
  description?: string;
  userCount: number;
  cells: RBACPermissionCell[];
}

export interface RBACPermissionCatalog {
  resource: string;
  action: string;
  permissionId: string;
  description?: string;
}

export interface RBACUserDetail {
  profile: User;
  membership: {
    role: string;
    is_active: boolean;
    tenant_id: string;
  };
  overrides: Array<{
    permissionId: string;
    effect: 'allow' | 'deny';
  }>;
  roles?: string[];
}

export interface RBACChangeOperation {
  op: 'assignRole' | 'removeRole' | 'setOverride' | 'clearOverride';
  userId: string;
  permissionId?: string;
  effect?: 'allow' | 'deny';
  roleId?: string;
}

export interface RBACApplyChangesRequest {
  tenantId: string;
  actorUserId: string;
  roleAssignments?: Array<{
    userId: string;
    roleId: string;
  }>;
  userOverrides?: Array<{
    userId: string;
    permissionId: string;
    effect: 'allow' | 'deny' | null; // null to clear override
  }>;
  auditNote?: string;
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================
export interface WorkRequestFormData {
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  urgency: UrgencyLevel;
  customer_id: string;
  due_date?: string;
  estimated_hours?: number;
  attachments?: File[];
}

export interface ProjectCharterFormData {
  title: string;
  description: string;
  objectives: string[];
  scope: string;
  deliverables: string[];
  timeline: string;
  budget: number;
  resources_required: string[];
  stakeholders: string[];
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  contact_person?: string;
  notes?: string;
}

// ============================================================================
// FILTER AND SEARCH INTERFACES
// ============================================================================
export interface WorkRequestFilters {
  status?: RequestStatus[];
  priority?: PriorityLevel[];
  category?: string[];
  assigned_to?: string[];
  customer_id?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ProjectCharterFilters {
  approval_status?: string[];
  assigned_to?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

