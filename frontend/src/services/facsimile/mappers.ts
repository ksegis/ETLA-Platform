// Data mappers for facsimile documents

import { PayStatement, Timecard, TaxRecord, Employee } from '../../types/facsimile';
import { formatCurrency, formatDate, formatTime, maskSSN } from '../../utils/privacy';

export interface FacsimilePayStatementData {
  employee_name: string;
  employee_id: string;
  employee_ssn_masked: string;
  employee_address: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  gross_pay_fmt: string;
  net_pay_fmt: string;
  regular_hours: string;
  overtime_hours: string;
  federal_tax_withheld_fmt: string;
  state_tax_withheld_fmt: string;
  social_security_tax_fmt: string;
  medicare_tax_fmt: string;
  ytd_gross_fmt: string;
  ytd_net_fmt: string;
  check_number: string;
  check_status: string;
}

export interface FacsimileTimecardData {
  employee_name: string;
  employee_id: string;
  employee_code: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  total_hours: string;
  regular_hours: string;
  overtime_hours: string;
  department: string;
  approval_status: string;
  supervisor: string;
}

export interface FacsimileTaxRecordData {
  employee_name: string;
  employee_id: string;
  tax_year: string;
  form_type: string;
  wages_tips_compensation_fmt: string;
  federal_income_tax_withheld_fmt: string;
  social_security_wages_fmt: string;
  social_security_tax_withheld_fmt: string;
  medicare_wages_fmt: string;
  medicare_tax_withheld_fmt: string;
  state_wages_fmt: string;
  state_income_tax_fmt: string;
  document_status: string;
}

export function mapToFacsimilePayStatement(
  payStatement: PayStatement, 
  employee?: Employee,
  locale: string = 'en-US'
): FacsimilePayStatementData {
  return {
    employee_name: payStatement.employee_name || employee?.full_name || `${employee?.first_name} ${employee?.last_name}` || '',
    employee_id: payStatement.employee_id,
    employee_ssn_masked: maskSSN(''), // SSN not in pay_statements table
    employee_address: employee?.home_address || '',
    period_start: formatDate(payStatement.pay_period_start, locale),
    period_end: formatDate(payStatement.pay_period_end, locale),
    pay_date: formatDate(payStatement.pay_date, locale),
    gross_pay_fmt: formatCurrency(payStatement.gross_pay, locale),
    net_pay_fmt: formatCurrency(payStatement.net_pay, locale),
    regular_hours: (payStatement.regular_hours || 0).toString(),
    overtime_hours: (payStatement.overtime_hours || 0).toString(),
    federal_tax_withheld_fmt: formatCurrency(payStatement.federal_tax_withheld, locale),
    state_tax_withheld_fmt: formatCurrency(payStatement.state_tax_withheld, locale),
    social_security_tax_fmt: formatCurrency(payStatement.social_security_tax, locale),
    medicare_tax_fmt: formatCurrency(payStatement.medicare_tax, locale),
    ytd_gross_fmt: formatCurrency(payStatement.ytd_gross, locale),
    ytd_net_fmt: formatCurrency(payStatement.ytd_net, locale),
    check_number: payStatement.check_number,
    check_status: payStatement.check_status || 'issued'
  };
}

export function mapToFacsimileTimecard(
  timecard: Timecard,
  employee?: Employee,
  locale: string = 'en-US'
): FacsimileTimecardData {
  return {
    employee_name: timecard.employee_name || employee?.full_name || `${employee?.first_name} ${employee?.last_name}` || '',
    employee_id: timecard.employee_id || '',
    employee_code: timecard.employee_code || '',
    work_date: formatDate(timecard.work_date, locale),
    clock_in: formatTime(timecard.clock_in),
    clock_out: formatTime(timecard.clock_out),
    total_hours: (timecard.total_hours || 0).toString(),
    regular_hours: (timecard.regular_hours || 0).toString(),
    overtime_hours: (timecard.overtime_hours || 0).toString(),
    department: timecard.department || '',
    approval_status: timecard.approval_status || 'pending',
    supervisor: timecard.supervisor || ''
  };
}

export function mapToFacsimileTaxRecord(
  taxRecord: TaxRecord,
  employee?: Employee,
  locale: string = 'en-US'
): FacsimileTaxRecordData {
  return {
    employee_name: employee?.full_name || `${employee?.first_name} ${employee?.last_name}` || '',
    employee_id: taxRecord.employee_id,
    tax_year: taxRecord.tax_year.toString(),
    form_type: taxRecord.form_type,
    wages_tips_compensation_fmt: formatCurrency(taxRecord.wages_tips_compensation, locale),
    federal_income_tax_withheld_fmt: formatCurrency(taxRecord.federal_income_tax_withheld, locale),
    social_security_wages_fmt: formatCurrency(taxRecord.social_security_wages, locale),
    social_security_tax_withheld_fmt: formatCurrency(taxRecord.social_security_tax_withheld, locale),
    medicare_wages_fmt: formatCurrency(taxRecord.medicare_wages, locale),
    medicare_tax_withheld_fmt: formatCurrency(taxRecord.medicare_tax_withheld, locale),
    state_wages_fmt: formatCurrency(taxRecord.state_wages, locale),
    state_income_tax_fmt: formatCurrency(taxRecord.state_income_tax, locale),
    document_status: taxRecord.document_status || 'draft'
  };
}

