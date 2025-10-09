// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!

// Check if we're in demo mode (only when explicitly set to demo values)
const isDemoMode = supabaseUrl === 'https://demo.supabase.co' ||
                   supabaseAnonKey === 'demo_anon_key' ||
                   (!supabaseUrl && !supabaseAnonKey)

// Mock data for demo mode
const mockUsers = [
  {
    id: 'b224935f-732f-4b09-a4a0-16492c5ae563',
    email: 'demo@company.com',
    full_name: 'Demo Host Admin',
    phone: '+1-555-0101',
    department: 'IT Administration',
    job_title: 'System Administrator',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-12-01T10:00:00Z',
    tenant_users: [{
      role: 'host_admin',
      role_level: 'senior',
      is_active: true,
      tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
      is_primary_tenant: true,
      requires_password_change: false,
      permission_scope: 'all',
      can_invite_users: true,
      can_manage_sub_clients: true,
      tenants: { name: 'Demo Company', code: 'DEMO' }
    }]
  },
  {
    id: 'user2-id',
    email: 'client.admin@company.com',
    full_name: 'Client Admin User',
    phone: '+1-555-0102',
    department: 'Operations',
    job_title: 'Operations Manager',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    last_sign_in_at: '2024-11-30T15:30:00Z',
    tenant_users: [{
      role: 'client_admin',
      role_level: 'standard',
      is_active: true,
      tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
      is_primary_tenant: true,
      requires_password_change: false,
      permission_scope: 'tenant',
      can_invite_users: true,
      can_manage_sub_clients: false,
      tenants: { name: 'Demo Company', code: 'DEMO' }
    }]
  },
  {
    id: 'user3-id',
    email: 'user@company.com',
    full_name: 'Regular User',
    phone: '+1-555-0103',
    department: 'Finance',
    job_title: 'Financial Analyst',
    status: 'active',
    created_at: '2024-01-03T00:00:00Z',
    last_sign_in_at: '2024-11-29T09:15:00Z',
    tenant_users: [{
      role: 'user',
      role_level: 'standard',
      is_active: true,
      tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
      is_primary_tenant: true,
      requires_password_change: false,
      permission_scope: 'own',
      can_invite_users: false,
      can_manage_sub_clients: false,
      tenants: { name: 'Demo Company', code: 'DEMO' }
    }]
  },
  {
    id: 'user4-id',
    email: 'manager@company.com',
    full_name: 'Project Manager',
    phone: '+1-555-0104',
    department: 'Project Management',
    job_title: 'Senior Project Manager',
    status: 'active',
    created_at: '2024-01-04T00:00:00Z',
    last_sign_in_at: '2024-12-01T08:45:00Z',
    tenant_users: [{
      role: 'project_manager',
      role_level: 'senior',
      is_active: true,
      tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
      is_primary_tenant: true,
      requires_password_change: false,
      permission_scope: 'department',
      can_invite_users: true,
      can_manage_sub_clients: false,
      tenants: { name: 'Demo Company', code: 'DEMO' }
    }]
  },
  {
    id: 'user5-id',
    email: 'analyst@company.com',
    full_name: 'Data Analyst',
    phone: '+1-555-0105',
    department: 'Analytics',
    job_title: 'Senior Data Analyst',
    status: 'active',
    created_at: '2024-01-05T00:00:00Z',
    last_sign_in_at: '2024-11-28T14:20:00Z',
    tenant_users: [{
      role: 'analyst',
      role_level: 'senior',
      is_active: true,
      tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
      is_primary_tenant: true,
      requires_password_change: false,
      permission_scope: 'department',
      can_invite_users: false,
      can_manage_sub_clients: false,
      tenants: { name: 'Demo Company', code: 'DEMO' }
    }]
  }
]

const mockTenants = [
  {
    id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    name: 'Demo Company',
    code: 'DEMO',
    status: 'active',
    tenant_type: 'enterprise',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockInvitations = [
  {
    id: 'invite1-id',
    email: 'newuser@company.com',
    full_name: 'New User',
    role: 'user',
    status: 'pending',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    created_at: '2024-11-25T00:00:00Z',
    expires_at: '2024-12-25T00:00:00Z',
    invited_by: 'b224935f-732f-4b09-a4a0-16492c5ae563',
    tenants: { name: 'Demo Company' },
    invited_by_profile: { full_name: 'Demo Host Admin' }
  }
]

const mockNotifications = [
  {
    id: 'notif1-id',
    type: 'user_invitation',
    title: 'New User Invitation',
    message: 'A new user invitation has been sent to newuser@company.com',
    user_id: 'b224935f-732f-4b09-a4a0-16492c5ae563',
    is_read: false,
    created_at: '2024-11-25T00:00:00Z',
    data: { email: 'newuser@company.com' }
  }
]

// Mock data for comprehensive reports
const mockEmployeeReports = [
  {
    id: 'emp1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@company.com',
    employment_status: 'active',
    home_department: 'Engineering',
    flsa_status: 'exempt',
    union_status: 'non_union',
    eeo_categories: 'Professional',
    job_title: 'Senior Software Engineer',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'emp2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@company.com',
    employment_status: 'active',
    home_department: 'Marketing',
    flsa_status: 'non-exempt',
    union_status: 'non_union',
    eeo_categories: 'Professional',
    job_title: 'Marketing Manager',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'emp3',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    first_name: 'Mike',
    last_name: 'Davis',
    email: 'mike.davis@company.com',
    employment_status: 'active',
    home_department: 'Sales',
    flsa_status: 'exempt',
    union_status: 'non_union',
    eeo_categories: 'Sales',
    job_title: 'Sales Director',
    created_at: '2024-02-01T00:00:00Z'
  }
]

const mockPayStatements = [
  {
    id: 'pay1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    user_id: 'emp1',
    pay_date: '2024-11-30',
    gross_pay: 8500,
    net_pay: 6200,
    federal_tax_withheld: 1200,
    state_tax_withheld: 400,
    department: 'Engineering',
    regular_hours: 80,
    overtime_hours: 5
  },
  {
    id: 'pay2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    user_id: 'emp2',
    pay_date: '2024-11-30',
    gross_pay: 6500,
    net_pay: 4800,
    federal_tax_withheld: 900,
    state_tax_withheld: 300,
    department: 'Marketing',
    regular_hours: 80,
    overtime_hours: 2
  },
  {
    id: 'pay3',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    user_id: 'emp3',
    pay_date: '2024-11-30',
    gross_pay: 9500,
    net_pay: 6900,
    federal_tax_withheld: 1400,
    state_tax_withheld: 500,
    department: 'Sales',
    regular_hours: 80,
    overtime_hours: 8
  }
]

const mockTimecardsV2 = [
  {
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    employee_ref: 'emp-001',
    employee_name: 'John Doe',
    work_date: '2025-09-23',
    first_clock_in: '08:00:00',
    mid_clock_out: '12:00:00',
    mid_clock_in: '13:00:00',
    last_clock_out: '17:00:00',
    total_hours: 8.00,
    regular_hours: 8.00,
    ot_hours: 0.00,
    dt_hours: 0.00,
    is_corrected: false,
    corrected_by: null,
    corrected_at: null,
    correction_reason: null,
    employee_id: 'e123',
    employee_code: 'JD001'
  },
  {
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    employee_ref: 'emp-001',
    employee_name: 'John Doe',
    work_date: '2025-09-24',
    first_clock_in: '08:00:00',
    mid_clock_out: '12:00:00',
    mid_clock_in: '13:00:00',
    last_clock_out: '18:00:00',
    total_hours: 9.00,
    regular_hours: 8.00,
    ot_hours: 1.00,
    dt_hours: 0.00,
    is_corrected: false,
    corrected_by: null,
    corrected_at: null,
    correction_reason: null,
    employee_id: 'e123',
    employee_code: 'JD001'
  },
  {
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    employee_ref: 'emp-002',
    employee_name: 'Jane Smith',
    work_date: '2025-09-23',
    first_clock_in: '09:00:00',
    mid_clock_out: '13:00:00',
    mid_clock_in: '14:00:00',
    last_clock_out: '18:00:00',
    total_hours: 8.00,
    regular_hours: 8.00,
    ot_hours: 0.00,
    dt_hours: 0.00,
    is_corrected: true,
    corrected_by: 'admin@example.com',
    corrected_at: '2025-09-25T10:00:00Z',
    correction_reason: 'Missed punch correction'
  }
]

const mockJobs = [
  {
    id: 'job1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    flsa_classification: 'exempt',
    pay_range_min: 120000,
    pay_range_max: 160000,
    employee_count: 5
  },
  {
    id: 'job2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    title: 'Marketing Manager',
    department: 'Marketing',
    flsa_classification: 'non-exempt',
    pay_range_min: 70000,
    pay_range_max: 90000,
    employee_count: 3
  },
  {
    id: 'job3',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    title: 'Sales Director',
    department: 'Sales',
    flsa_classification: 'exempt',
    pay_range_min: 100000,
    pay_range_max: 140000,
    employee_count: 2
  }
]

const mockTaxRecords = Array.from({ length: 50 }, (_, i) => {
  const formTypes = ['W-2', '1099-MISC', '1099-NEC'];
  const statuses = ['completed', 'pending', 'filed', 'under_review'];
  const taxYears = ['2024', '2023', '2022', '2021'];
  const employees = ['emp1', 'emp2', 'emp3', 'emp4', 'emp5'];
  
  const baseWage = 45000 + (i * 1000);
  const taxRate = 0.18 + (i % 5) * 0.02;
  
  return {
    id: `tax${i + 1}`,
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    employee_id: employees[i % employees.length],
    employee_code: `EMP${String(i + 1).padStart(3, '0')}`,
    form_type: formTypes[i % formTypes.length],
    tax_year: taxYears[i % taxYears.length],
    status: statuses[i % statuses.length],
    filing_status: i % 2 === 0 ? 'single' : 'married',
    total_wages: baseWage,
    federal_tax: Math.round(baseWage * taxRate),
    state_tax: Math.round(baseWage * (taxRate * 0.6)),
    total_taxes_withheld: Math.round(baseWage * (taxRate * 1.6)),
    created_at: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`
  };
})

const mockBenefits = [
  {
    id: 'ben1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    deduction_type: 'Health Insurance',
    employee_contribution: 150,
    employer_contribution: 400,
    frequency: 'monthly',
    is_garnishment: false
  },
  {
    id: 'ben2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    deduction_type: '401k',
    employee_contribution: 500,
    employer_contribution: 250,
    frequency: 'monthly',
    is_garnishment: false
  }
]

const mockCompliance = [
  {
    id: 'comp1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    compliance_type: 'OSHA',
    status: 'current',
    due_date: '2024-12-31',
    is_overdue: false
  },
  {
    id: 'comp2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    compliance_type: 'EEO-1',
    status: 'pending',
    due_date: '2024-12-15',
    is_overdue: false
  }
]

const mockWorkRequests = [
  {
    id: 'wr1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    title: 'Website Redesign Project',
    description: 'Complete redesign of company website with modern UI/UX',
    category: 'Web Development',
    priority: 'high',
    urgency: 'medium',
    status: 'in_progress',
    customer_id: 'cust1',
    assigned_to: 'emp1',
    estimated_hours: 120,
    actual_hours: 45,
    budget: 15000,
    created_at: '2024-11-01T00:00:00Z'
  },
  {
    id: 'wr2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    title: 'Marketing Campaign Analysis',
    description: 'Analyze Q4 marketing campaign performance and ROI',
    category: 'Marketing',
    priority: 'medium',
    urgency: 'low',
    status: 'completed',
    customer_id: 'cust2',
    assigned_to: 'emp2',
    estimated_hours: 40,
    actual_hours: 38,
    budget: 5000,
    created_at: '2024-10-15T00:00:00Z'
  }
]

const mockProjects = [
  {
    id: 'proj1',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    work_request_id: 'wr1',
    title: 'Website Redesign Implementation',
    description: 'Implementation phase of the website redesign project',
    status: 'in_progress',
    priority: 'high',
    assigned_team_lead: 'emp1',
    estimated_hours: 120,
    actual_hours: 45,
    budget: 15000,
    start_date: '2024-11-01',
    end_date: '2024-12-31',
    completion_percentage: 40,
    created_at: '2024-11-01T00:00:00Z'
  },
  {
    id: 'proj2',
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    work_request_id: 'wr2',
    title: 'Q4 Marketing Analysis',
    description: 'Complete analysis of Q4 marketing campaigns',
    status: 'completed',
    priority: 'medium',
    assigned_team_lead: 'emp2',
    estimated_hours: 40,
    actual_hours: 38,
    budget: 5000,
    start_date: '2024-10-15',
    end_date: '2024-11-15',
    completion_percentage: 100,
    created_at: '2024-10-15T00:00:00Z'
  }
]

// Create mock Supabase client for demo mode
const createMockSupabaseClient = () => {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => ({
            limit: (limit: number) => Promise.resolve({ data: getMockData(table), error: null }),
            then: (resolve: any) => resolve({ data: getMockData(table), error: null })
          }),
          then: (resolve: any) => resolve({ data: getMockData(table), error: null })
        }),
        in: (column: string, values: any[]) => ({
          order: (column: string, options?: any) => ({
            limit: (limit: number) => Promise.resolve({ data: getMockData(table), error: null }),
            then: (resolve: any) => resolve({ data: getMockData(table), error: null })
          }),
          then: (resolve: any) => resolve({ data: getMockData(table), error: null })
        }),
        or: (condition: string) => ({
          order: (column: string, options?: any) => ({
            limit: (limit: number) => Promise.resolve({ data: getMockData(table), error: null }),
            then: (resolve: any) => resolve({ data: getMockData(table), error: null })
          }),
          then: (resolve: any) => resolve({ data: getMockData(table), error: null })
        }),
        order: (column: string, options?: any) => ({
          then: (resolve: any) => resolve({ data: getMockData(table), error: null })
        }),
        then: (resolve: any) => resolve({ data: getMockData(table), error: null })
      }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

const getMockData = (table: string) => {
  switch (table) {
    case 'profiles':
      return mockUsers
    case 'tenants':
      return mockTenants
    case 'user_invitations':
      return mockInvitations
    case 'admin_notifications':
      return mockNotifications
    case 'employee_comprehensive_report':
      return mockEmployeeReports
    case 'pay_statements_comprehensive_report':
      return mockPayStatements
    case 'v_timecard_daily_effective_v2':
      return mockTimecardsV2
    case 'jobs_comprehensive_report':
      return mockJobs
    case 'tax_records_comprehensive_report':
      return mockTaxRecords
    case 'tax_records':
      return mockTaxRecords
    case 'benefits_deductions_comprehensive_report':
      return mockBenefits
    case 'compliance_records_comprehensive_report':
      return mockCompliance
    case 'work_requests':
      return mockWorkRequests
    case 'projects':
      return mockProjects
    default:
      return []
  }
}

export const supabase = isDemoMode ? createMockSupabaseClient() as any : createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours: number
  budget?: number
  required_completion_date?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  tenant_id: string
  work_request_id: string
  title: string
  description?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_team_lead: string
  estimated_hours: number
  actual_hours: number
  budget?: number
  start_date: string
  end_date: string
  completion_percentage: number
  client_satisfaction_score?: number
  on_time_delivery?: boolean
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  company_name: string
  subdomain?: string
  industry?: string
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  subscription_plan: 'trial' | 'professional' | 'enterprise'
  created_at: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'host_admin' | 'program_manager' | 'client_admin' | 'client_user'
  tenant_id?: string
  is_active: boolean
  created_at: string
}

// Auth helpers
export const signInWithRole = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (data.user) {
    // Get user profile with role and tenant
    const { data: profile } = await supabase
      .from('users')
      .select('role, tenant_id, first_name, last_name')
      .eq('id', data.user.id)
      .single()
    
    return { user: data.user, profile, error }
  }
  
  return { user: null, profile: null, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Database helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { ...user, profile }
}

// User Management Methods
export const userManagement = {
  // Create a new user with complete RBAC setup
  createUser: async (userData: UserCreationData) => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role,
          role_level: userData.role_level
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create the user profile (FIXED: using 'profiles' not 'user_profiles')
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          department: userData.department,
          job_title: userData.job_title,
          role: userData.role,
          role_level: userData.role_level,
          tenant_id: userData.tenant_id,
          is_active: true,
          can_invite_users: userData.can_invite_users,
          can_manage_sub_clients: userData.can_manage_sub_clients,
          permission_scope: userData.permission_scope,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: `Profile creation failed: ${profileError.message}` }
      }

      // NEW: Create tenant_users record for RBAC
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: userData.tenant_id,
          user_id: authData.user.id,
          role: userData.role,
          role_level: userData.role_level,
          can_invite_users: userData.can_invite_users,
          can_manage_sub_clients: userData.can_manage_sub_clients,
          permission_scope: userData.permission_scope,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (tenantUserError) {
        // If tenant_users creation fails, clean up auth user and profile
        await supabase.auth.admin.deleteUser(authData.user.id)
        await supabase.from('profiles').delete().eq('id', authData.user.id)
        return { success: false, error: `Tenant assignment failed: ${tenantUserError.message}` }
      }

      // OPTIONAL: Create audit log if table exists
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: authData.user.id,
            tenant_id: userData.tenant_id,
            action: 'user_created',
            resource_type: 'user',
            resource_id: authData.user.id,
            details: {
              created_by: 'admin_interface',
              role: userData.role,
              role_level: userData.role_level,
              email: userData.email
            },
            ip_address: '127.0.0.1',
            user_agent: 'Admin Interface',
            severity: 'info',
            created_at: new Date().toISOString()
          })
      } catch (auditError) {
        // Audit log is optional, don't fail the user creation
        console.warn('Audit log creation failed:', auditError)
      }

      return { success: true, data: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create user' }
    }
  },

  // Send password reset email
  sendPasswordReset: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Password reset email sent successfully' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send password reset email' }
    }
  },

  // Send user invitation
  sendInvitation: async (invitationData: {
    email: string
    tenant_id: string
    role: string
    role_level: string
    invited_by_name?: string
    tenant_name?: string
  }) => {
    try {
      // Create the user account with a temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: invitationData.email,
        password: tempPassword,
        email_confirm: false, // User must confirm via invite email
        user_metadata: {
          role: invitationData.role,
          role_level: invitationData.role_level,
          invited_by_name: invitationData.invited_by_name,
          tenant_name: invitationData.tenant_name,
          is_invited: true
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: invitationData.email,
          role: invitationData.role,
          role_level: invitationData.role_level,
          tenant_id: invitationData.tenant_id,
          is_active: false, // Will be activated when they accept invite
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: `Profile creation failed: ${profileError.message}` }
      }

      // Create tenant_users record
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: invitationData.tenant_id,
          user_id: authData.user.id,
          role: invitationData.role,
          role_level: invitationData.role_level,
          is_active: false, // Will be activated when they accept invite
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (tenantUserError) {
        // Clean up auth user and profile if tenant_users creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        await supabase.from('profiles').delete().eq('id', authData.user.id)
        return { success: false, error: `Tenant assignment failed: ${tenantUserError.message}` }
      }

      // Send invitation email
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(invitationData.email, {
        redirectTo: `${window.location.origin}/accept-invite`,
        data: {
          role: invitationData.role,
          role_level: invitationData.role_level,
          invited_by_name: invitationData.invited_by_name,
          tenant_name: invitationData.tenant_name
        }
      })

      if (inviteError) {
        // Clean up created records if invite email fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        await supabase.from('profiles').delete().eq('id', authData.user.id)
        await supabase.from('tenant_users').delete().eq('user_id', authData.user.id)
        return { success: false, error: `Failed to send invitation: ${inviteError.message}` }
      }

      // Create invitation record for tracking (if table exists)
      try {
        await supabase
          .from('user_invitations')
          .insert({
            email: invitationData.email,
            tenant_id: invitationData.tenant_id,
            invited_by: authData.user.id,
            role: invitationData.role,
            role_level: invitationData.role_level,
            status: 'sent',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            created_at: new Date().toISOString()
          })
      } catch (inviteRecordError) {
        // Invitation record is optional, don't fail the entire process
        console.warn('Failed to create invitation record:', inviteRecordError)
      }

      return { success: true, data: authData.user, message: 'Invitation sent successfully' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send invitation' }
    }
  },

  // Resend invitation
  resendInvitation: async (email: string) => {
    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${window.location.origin}/accept-invite`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update invitation record status (if table exists)
      try {
        await supabase
          .from('user_invitations')
          .update({
            status: 'resent',
            updated_at: new Date().toISOString()
          })
          .eq('email', email)
          .eq('status', 'sent')
      } catch (updateError) {
        // Invitation record update is optional
        console.warn('Failed to update invitation record:', updateError)
      }

      return { success: true, message: 'Invitation resent successfully' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to resend invitation' }
    }
  },

  // Activate user account after invite acceptance
  activateInvitedUser: async (userId: string) => {
    try {
      // Update profile to active
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {
        return { success: false, error: `Failed to activate profile: ${profileError.message}` }
      }

      // Update tenant_users to active
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (tenantUserError) {
        return { success: false, error: `Failed to activate tenant assignment: ${tenantUserError.message}` }
      }

      // Update invitation record status (if table exists)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          await supabase
            .from('user_invitations')
            .update({
              status: 'accepted',
              accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('email', user.email)
            .in('status', ['sent', 'resent'])
        }
      } catch (updateError) {
        // Invitation record update is optional
        console.warn('Failed to update invitation record:', updateError)
      }

      return { success: true, message: 'User account activated successfully' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to activate user account' }
    }
  },
  inviteUsers: async (invitationData: UserInvitationData) => {
    try {
      const invitations = []
      
      for (const email of invitationData.emails) {
        // Create invitation record
        const { data: invitation, error: inviteError } = await supabase
          .from('user_invitations')
          .insert({
            email,
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: invitationData.tenant_id,
            message: invitationData.message,
            expires_at: new Date(Date.now() + invitationData.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (inviteError) {
          console.error(`Failed to create invitation for ${email}:`, inviteError)
          continue
        }

        // Send invitation email using Supabase Auth
        const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${window.location.origin}/accept-invitation?token=${invitation.id}`,
          data: {
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: invitationData.tenant_id,
            invitation_id: invitation.id
          }
        })

        if (emailError) {
          console.error(`Failed to send invitation email to ${email}:`, emailError)
          // Mark invitation as failed
          await supabase
            .from('user_invitations')
            .update({ status: 'failed' })
            .eq('id', invitation.id)
        } else {
          invitations.push(invitation)
        }
      }

      return { 
        success: true, 
        data: { 
          sent: invitations.length, 
          total: invitationData.emails.length 
        } 
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send invitations' }
    }
  },

  // Update user information
  updateUser: async (userId: string, updateData: UserUpdateData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update user' }
    }
  },

  // Deactivate user
  deactivateUser: async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to deactivate user' }
    }
  },

  // Activate user
  activateUser: async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to activate user' }
    }
  },

  // Reset user password
  resetUserPassword: async (email: string, newPassword?: string) => {
    try {
      if (newPassword) {
        // Direct password reset (admin function)
        const { error } = await supabase.auth.admin.updateUserById(
          email, // This should be user ID, but we'll need to get it first
          { password: newPassword }
        )

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      } else {
        // Email-based password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reset password' }
    }
  },

  // Preview cleanup operations
  previewUserCleanup: async (options: CleanupOptions) => {
    try {
      let inactiveUsers = 0
      let unconfirmedUsers = 0
      let expiredInvites = 0

      if (options.deleteInactiveUsers) {
        const cutoffDate = new Date(Date.now() - options.inactiveDays * 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lt('last_login', cutoffDate)
          .eq('is_active', true)

        inactiveUsers = count || 0
      }

      if (options.deleteUnconfirmedUsers) {
        const cutoffDate = new Date(Date.now() - options.unconfirmedDays * 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true })
          .is('email_confirmed_at', null)
          .lt('created_at', cutoffDate)

        unconfirmedUsers = count || 0
      }

      if (options.deleteExpiredInvites) {
        const { count } = await supabase
          .from('user_invitations')
          .select('*', { count: 'exact', head: true })
          .lt('expires_at', new Date().toISOString())
          .neq('status', 'accepted')

        expiredInvites = count || 0
      }

      const totalToDelete = inactiveUsers + unconfirmedUsers + expiredInvites

      return {
        success: true,
        data: {
          inactiveUsers,
          unconfirmedUsers,
          expiredInvites,
          totalToDelete
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to preview cleanup' }
    }
  },

  // Execute cleanup operations
  executeUserCleanup: async (options: CleanupOptions) => {
    try {
      let deletedCount = 0

      if (options.deleteInactiveUsers) {
        const cutoffDate = new Date(Date.now() - options.inactiveDays * 24 * 60 * 60 * 1000).toISOString()
        
        // Get inactive users
        const { data: inactiveUsers } = await supabase
          .from('profiles')
          .select('id')
          .lt('last_login', cutoffDate)
          .eq('is_active', true)

        if (inactiveUsers) {
          for (const user of inactiveUsers) {
            // Delete auth user
            await supabase.auth.admin.deleteUser(user.id)
            // Delete profile
            await supabase
              .from('profiles')
              .delete()
              .eq('id', user.id)
          }
          deletedCount += inactiveUsers.length
        }
      }

      if (options.deleteUnconfirmedUsers) {
        const cutoffDate = new Date(Date.now() - options.unconfirmedDays * 24 * 60 * 60 * 1000).toISOString()
        
        // This would require admin access to auth.users table
        // For now, we'll mark them as inactive
        const { data: unconfirmedUsers } = await supabase
          .from('profiles')
          .select('id')
          .lt('created_at', cutoffDate)
          .eq('is_active', true)

        if (unconfirmedUsers) {
          await supabase
            .from('profiles')
            .update({ is_active: false })
            .in('id', unconfirmedUsers.map(u => u.id))
          
          deletedCount += unconfirmedUsers.length
        }
      }

      if (options.deleteExpiredInvites) {
        const { count } = await supabase
          .from('user_invitations')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .neq('status', 'accepted')

        deletedCount += count || 0
      }

      return { success: true, data: { deletedCount } }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to execute cleanup' }
    }
  }
}

// Add user management methods to the main supabase object for backward compatibility
Object.assign(supabase, userManagement)

