// Facsimile system types based on actual database schema

export interface PayStatement {
  id: string;
  check_number: string;
  employee_id: string;
  employee_name: string;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  net_pay: number;
  deposit_last4?: string;
  customer_id: string;
  tenant_id?: string;
  employee_code?: string;
  gross_pay?: number;
  regular_hours?: number;
  overtime_hours?: number;
  doubletime_hours?: number;
  regular_pay?: number;
  overtime_pay?: number;
  bonus_amount?: number;
  commission_amount?: number;
  pretax_deductions_total?: number;
  pretax_deduction_details?: any;
  posttax_deductions_total?: number;
  posttax_deduction_details?: any;
  federal_tax_withheld?: number;
  state_tax_withheld?: number;
  social_security_tax?: number;
  medicare_tax?: number;
  local_tax_withheld?: number;
  ytd_gross?: number;
  ytd_net?: number;
  ytd_federal_tax?: number;
  ytd_state_tax?: number;
  ytd_social_security?: number;
  ytd_medicare?: number;
  direct_deposit_details?: any;
  check_status?: string;
  audit_trail?: any;
}

export interface Timecard {
  id: string;
  customer_id: string;
  tenant_id?: string;
  employee_id?: string;
  employee_code?: string;
  employee_name?: string;
  work_date?: string;
  clock_in?: string;
  clock_out?: string;
  total_hours?: number;
  regular_hours?: number;
  department?: string;
  created_at?: string;
  updated_at?: string;
  supervisor?: string;
  day_of_week?: string;
  shift_code?: string;
  schedule_code?: string;
  overtime_hours?: number;
  doubletime_hours?: number;
  holiday_hours?: number;
  pto_hours?: any;
  job_codes?: any;
  approval_status?: string;
  approver_id?: string;
  approval_date?: string;
  exceptions?: any;
  edits?: any;
  audit_trail?: any;
}

export interface TaxRecord {
  id: string;
  tax_record_id: string;
  employee_id: string;
  customer_id: string;
  tenant_id?: string;
  tax_year: number;
  form_type: string;
  document_data: any;
  filing_status?: string;
  tax_jurisdiction?: string;
  state_code?: string;
  local_jurisdiction?: string;
  wages_tips_compensation?: number;
  federal_income_tax_withheld?: number;
  social_security_wages?: number;
  social_security_tax_withheld?: number;
  medicare_wages?: number;
  medicare_tax_withheld?: number;
  state_wages?: number;
  state_income_tax?: number;
  nonemployee_compensation?: number;
  misc_income?: number;
  document_status?: string;
  issue_date?: string;
  correction_date?: string;
  created_at?: string;
  updated_at?: string;
  audit_trail?: any;
}

export interface Employee {
  id: string;
  tenant_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  hire_date: string;
  customer_id: string;
  employee_name?: string;
  full_name?: string;
  department?: string;
  position?: string;
  home_address?: string;
}

export interface FacsimileTheme {
  meta: {
    schema_version: string;
    brand: string;
    variant: string;
    watermark_text: string;
    default_locale: string;
    pdf_page_size: string;
    pdf_margin_in: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  design_tokens: {
    colors: {
      primary: string;
      primaryDark: string;
      accent: string;
      ink: string;
      mutedInk: string;
      border: string;
      bg: string;
      bgSubtle: string;
      alert: string;
      danger: string;
    };
    typography: {
      font_family: string;
      mono_family: string;
      scale: {
        h1: number;
        h2: number;
        h3: number;
        body: number;
        small: number;
        micro: number;
      };
      line_height: number;
    };
    layout: {
      radius: number;
      gutter: number;
      section_gap: number;
      grid_cols: number;
    };
    watermark: {
      opacity: number;
      font_size: number;
      angle_deg: number;
      repeat: boolean;
    };
    badges: {
      FACSIMILE: {
        label: string;
        bg: string;
        fg: string;
        border: string;
      };
    };
  };
  branding: {
    logo_url: string;
    lockup: string;
    footer_disclaimer: string;
    contact_line: string;
  };
  privacy_rules: {
    masking: {
      ssn: { show: string; mask_char: string };
      ein: { show: string; mask_char: string };
      bank_account: { show: string; mask_char: string };
    };
    redact_fields: string[];
    pii_banner: string;
  };
  verification: {
    qr_enable: boolean;
    qr_caption: string;
    hash_algo: string;
    hash_fields: string[];
    verify_base_url: string;
  };
  templates: {
    [key: string]: {
      document_type: string;
      sections: any[];
    };
  };
}

export type FacsimileTemplateKey = 'pay_statement' | 'timecard' | 'tax_w2' | 'tax_1099';

export interface FacsimileDocumentProps {
  templateKey: FacsimileTemplateKey;
  data: PayStatement | Timecard | TaxRecord;
  theme?: FacsimileTheme;
  locale?: string;
  employee?: Employee;
}

