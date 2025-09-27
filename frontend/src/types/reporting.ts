export interface Employee {
  id: string
  employee_id: string
  employee_code?: string
  full_name: string
  first_name: string
  last_name: string
  email?: string
  job_title?: string
  department?: string
  position?: string
  hire_date: string
  termination_date?: string
  status: string
  employment_status?: string
  employment_type?: string
  work_location?: string
  manager_supervisor?: string
  annual_salary?: number
  hourly_rate?: number
  pay_type?: string
  pay_frequency?: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface EmployeeDemographics {
  id: string
  employee_code: string
  customer_id: string
  tenant_id?: string
  first_name?: string
  last_name?: string
  gender?: string
  marital_status?: string
  birth_date?: string
  date_of_birth?: string
  ethnic_background?: string
  ethnicity?: string
  race?: string
  veteran_status?: boolean
  has_disability?: boolean
  disability_category?: string
  work_authorization_status?: string
  citizenship_country?: string
  address_line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone_mobile?: string
  email?: string
  languages?: string[]
  education_level?: string
  job_title?: string
  department?: string
  location?: string
  manager_id?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  dependent_count?: number
  created_at: string
  updated_at: string
}

export interface PayStatementSummary {
  employee_id: string
  ytd_gross?: number
  ytd_net?: number
  total_hours_ytd?: number
  latest_pay_date?: string
  total_statements?: number
}

export interface EmployeeDocumentCount {
  employee_id: string
  document_count: number
}

export interface PayStatement {
  id: string;
  check_number: string;
  employee_id: string;
  employee_name: string;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  social_security_tax: number;
  medicare_tax: number;
  ytd_gross: number;
  ytd_net: number;
  check_status: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeJobHistory {
  id: string
  employee_id: string
  job_code: string
  job_title: string
  department: string
  start_date: string
  end_date?: string
  salary: number
  reason_for_change?: string
  is_current: boolean
  status: string; // Added status property
  created_at: string
}

export interface TaxRecord {
  id: string;
  employee_id: string;
  tax_year: number;
  form_type: string;
  document_url?: string;
  federal_wages: number;
  federal_tax_withheld: number;
  state_wages: number;
  state_tax_withheld: number;
  local_wages: number;
  local_tax_withheld: number;
  document_status?: string; // Added document_status property
  issue_date?: string; // Added issue_date property
  tax_record_id?: string; // Added tax_record_id property
  wages_tips_compensation?: number; // Added wages_tips_compensation property
  social_security_wages?: number; // Added social_security_wages property
  social_security_tax_withheld?: number; // Added social_security_tax_withheld property
  medicare_wages?: number; // Added medicare_wages property
  medicare_tax_withheld?: number; // Added medicare_tax_withheld property
  state_income_tax?: number; // Added state_income_tax property
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BenefitRecord {
  id: string;
  employee_id: string;
  benefit_type: string;
  provider: string;
  plan_name?: string; // Added plan_name property
  coverage_type?: string; // Added coverage_type property
  start_date: string;
  end_date?: string;
  termination_date?: string; // Added termination_date property
  status: string;
  employee_contribution: number;
  employer_contribution: number;
  coverage_level: string;
  enrollment_date?: string; // Added enrollment_date property
  effective_date?: string; // Added effective_date property
  coverage_amount?: number; // Added coverage_amount property
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimecardRecord {
  id: string;
  employee_id: string;
  work_date: string;
  hours_worked: number;
  project?: string;
  task?: string;
  status: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnhancedEmployeeData {
  employee: Employee
  demographics?: EmployeeDemographics
  payrollSummary?: PayStatementSummary
  documentCount?: number
}

export interface Department {
  id: string;
  name: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}



export interface DocumentRepositoryConfig {
  id: string
  tenant_id: string
  repository_type: 'local' | 'aws_s3' | 'azure_blob' | 'google_cloud' | 'sharepoint'
  repository_name: string
  connection_string: string
  access_key?: string
  secret_key?: string
  bucket_name?: string
  base_path: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DocumentRecord {
  id: string
  employee_id: string
  tenant_id: string
  document_name: string
  document_type: string
  file_path: string
  file_size: number
  upload_date: string
  document_category: string
  status: string
  tags: string[]
  metadata?: Record<string, any>
  thumbnail_path?: string
  is_confidential: boolean
  access_level: 'public' | 'restricted' | 'confidential'
  created_by: string
  last_accessed?: string
  document_status?: string; // Added document_status
}

export interface DocumentSearchFilters {
  employeeId?: string
  documentCategory?: string
  documentType?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  searchTerm?: string
  accessLevel?: string
}

