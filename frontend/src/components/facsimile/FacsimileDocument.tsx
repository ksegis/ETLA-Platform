'use client';

import React, { useState, useEffect } from 'react';
import { FacsimileDocumentProps, FacsimileTheme } from '../../types/facsimile';
import { 
  mapToFacsimilePayStatement, 
  mapToFacsimileTimecard, 
  mapToFacsimileTaxRecord,
  FacsimilePayStatementData,
  FacsimileTimecardData,
  FacsimileTaxRecordData
} from '../../services/facsimile/mappers';
import { generateDocumentHash, generateVerifyUrl } from '../../utils/hash';
import { useCustomerBranding } from '../../services/brandingService';
import facsimileThemeData from '../../config/facsimile_theme.json';

interface FacsimileDocumentState {
  mappedData: FacsimilePayStatementData | FacsimileTimecardData | FacsimileTaxRecordData | null;
  documentHash: string;
  verifyUrl: string;
}

export default function FacsimileDocument({ 
  templateKey, 
  data, 
  theme, 
  locale = 'en-US',
  employee 
}: FacsimileDocumentProps) {
  const [state, setState] = useState<FacsimileDocumentState>({
    mappedData: null,
    documentHash: '',
    verifyUrl: ''
  });

  // Get dynamic customer branding
  const tenantId = (data as any)?.tenant_id;
  const { branding } = useCustomerBranding(tenantId);

  const facsimileTheme: FacsimileTheme = theme || facsimileThemeData as FacsimileTheme;
  const template = facsimileTheme.templates[templateKey];

  useEffect(() => {
    async function processData() {
      let mappedData: any = null;
      
      switch (templateKey) {
        case 'pay_statement':
          mappedData = mapToFacsimilePayStatement(data as any, employee, locale);
          break;
        case 'timecard':
          mappedData = mapToFacsimileTimecard(data as any, employee, locale);
          break;
        case 'tax_w2':
          mappedData = mapToFacsimileTaxRecord(data as any, employee, locale);
          break;
        default:
          mappedData = data;
      }

      // Generate document hash for verification
      const hash = await generateDocumentHash(data as any, facsimileTheme.verification.hash_fields);
      const verifyUrl = generateVerifyUrl(
        facsimileTheme.verification.verify_base_url,
        (data as any).id || (data as any).tax_record_id || '',
        hash
      );

      setState({
        mappedData,
        documentHash: hash,
        verifyUrl
      });
    }

    processData();
  }, [templateKey, data, employee, locale, facsimileTheme]);

  if (!state.mappedData) {
    return <div className="p-4">Loading facsimile document...</div>;
  }

  const { colors, typography, layout } = facsimileTheme.design_tokens;

  return (
    <div 
      className="facsimile-document relative bg-white min-h-screen"
      style={{ 
        fontFamily: typography.font_family,
        fontSize: `${typography.scale.body}px`,
        lineHeight: typography.line_height,
        color: colors.ink
      }}
    >
      {/* Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
        style={{
          opacity: facsimileTheme.design_tokens.watermark.opacity,
          transform: `rotate(${facsimileTheme.design_tokens.watermark.angle_deg}deg)`,
          fontSize: `${facsimileTheme.design_tokens.watermark.font_size}px`,
          color: colors.mutedInk,
          fontWeight: 'bold'
        }}
      >
        {facsimileTheme.meta.watermark_text}
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 border-b pb-6" style={{ borderColor: colors.border }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 
                className="font-bold mb-2"
                style={{ 
                  fontSize: `${typography.scale.h1}px`,
                  color: colors.primary 
                }}
              >
                {branding?.legalName || facsimileTheme.branding.lockup}
              </h1>
              <p style={{ color: colors.mutedInk }}>
                {template.document_type}
              </p>
            </div>
            
            {/* FACSIMILE Badge */}
            <div 
              className="px-3 py-1 rounded border font-bold text-sm"
              style={{
                backgroundColor: facsimileTheme.design_tokens.badges.FACSIMILE.bg,
                color: facsimileTheme.design_tokens.badges.FACSIMILE.fg,
                borderColor: facsimileTheme.design_tokens.badges.FACSIMILE.border
              }}
            >
              {facsimileTheme.design_tokens.badges.FACSIMILE.label}
            </div>
          </div>

          {/* Document metadata */}
          <div className="grid grid-cols-3 gap-4 text-sm" style={{ color: colors.mutedInk }}>
            <div>
              <strong>Document Type:</strong> {template.document_type}
            </div>
            <div>
              <strong>Generated:</strong> {new Date().toLocaleDateString(locale)}
            </div>
            <div>
              <strong>Reference:</strong> {(data as any).id?.slice(0, 8) || 'N/A'}
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-8">
          {templateKey === 'pay_statement' && (
            <PayStatementContent data={state.mappedData as FacsimilePayStatementData} theme={facsimileTheme} />
          )}
          
          {templateKey === 'timecard' && (
            <TimecardContent data={state.mappedData as FacsimileTimecardData} theme={facsimileTheme} />
          )}
          
          {templateKey === 'tax_w2' && (
            <TaxRecordContent data={state.mappedData as FacsimileTaxRecordData} theme={facsimileTheme} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-sm" style={{ borderColor: colors.border, color: colors.mutedInk }}>
          <div className="flex justify-between items-center">
            <div>
              © {new Date().getFullYear()} {branding?.legalName || 'ETLA Platform'}. All rights reserved.
            </div>
            <div className="text-center">
              {facsimileTheme.branding.footer_disclaimer}
            </div>
            <div>
              Facsimile • {template.document_type}
            </div>
          </div>
          
          {facsimileTheme.verification.qr_enable && (
            <div className="mt-4 text-center">
              <p>{facsimileTheme.branding.contact_line}</p>
              <p className="text-xs mt-1">Document Hash: {state.documentHash.slice(0, 16)}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Pay Statement Content Component
function PayStatementContent({ data, theme }: { data: FacsimilePayStatementData; theme: FacsimileTheme }) {
  const { colors } = theme.design_tokens;
  
  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Employee</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {data.employee_name}</div>
            <div><strong>Employee ID:</strong> {data.employee_id}</div>
            <div><strong>Address:</strong> {data.employee_address || 'Not provided'}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Pay Period</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Period:</strong> {data.period_start} – {data.period_end}</div>
            <div><strong>Pay Date:</strong> {data.pay_date}</div>
            <div><strong>Check Number:</strong> {data.check_number}</div>
            <div><strong>Status:</strong> {data.check_status}</div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Earnings & Deductions</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Regular Hours ({data.regular_hours}):</span>
              <span>{data.gross_pay_fmt}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Hours ({data.overtime_hours}):</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: colors.border }}>
              <span>Gross Pay:</span>
              <span>{data.gross_pay_fmt}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Federal Tax:</span>
              <span>{data.federal_tax_withheld_fmt}</span>
            </div>
            <div className="flex justify-between">
              <span>State Tax:</span>
              <span>{data.state_tax_withheld_fmt}</span>
            </div>
            <div className="flex justify-between">
              <span>Social Security:</span>
              <span>{data.social_security_tax_fmt}</span>
            </div>
            <div className="flex justify-between">
              <span>Medicare:</span>
              <span>{data.medicare_tax_fmt}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: colors.border }}>
              <span>Net Pay:</span>
              <span>{data.net_pay_fmt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Summary */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Year-to-Date</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex justify-between">
            <span>YTD Gross:</span>
            <span>{data.ytd_gross_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>YTD Net:</span>
            <span>{data.ytd_net_fmt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timecard Content Component
function TimecardContent({ data, theme }: { data: FacsimileTimecardData; theme: FacsimileTheme }) {
  const { colors } = theme.design_tokens;
  
  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Employee</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div><strong>Name:</strong> {data.employee_name}</div>
          <div><strong>Employee ID:</strong> {data.employee_id}</div>
          <div><strong>Employee Code:</strong> {data.employee_code}</div>
          <div><strong>Department:</strong> {data.department}</div>
        </div>
      </div>

      {/* Time Summary */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Time Summary</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-2">
            <div><strong>Work Date:</strong> {data.work_date}</div>
            <div><strong>Clock In:</strong> {data.clock_in}</div>
            <div><strong>Clock Out:</strong> {data.clock_out}</div>
          </div>
          <div className="space-y-2">
            <div><strong>Total Hours:</strong> {data.total_hours}</div>
            <div><strong>Regular Hours:</strong> {data.regular_hours}</div>
            <div><strong>Overtime Hours:</strong> {data.overtime_hours}</div>
          </div>
        </div>
      </div>

      {/* Approval Status */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Approval</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div><strong>Status:</strong> {data.approval_status}</div>
          <div><strong>Supervisor:</strong> {data.supervisor || 'Not assigned'}</div>
        </div>
      </div>
    </div>
  );
}

// Tax Record Content Component
function TaxRecordContent({ data, theme }: { data: FacsimileTaxRecordData; theme: FacsimileTheme }) {
  const { colors } = theme.design_tokens;
  
  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Employee</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div><strong>Name:</strong> {data.employee_name}</div>
          <div><strong>Employee ID:</strong> {data.employee_id}</div>
        </div>
      </div>

      {/* Tax Information */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Tax Information</h3>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div><strong>Tax Year:</strong> {data.tax_year}</div>
          <div><strong>Form Type:</strong> {data.form_type}</div>
          <div><strong>Status:</strong> {data.document_status}</div>
        </div>
      </div>

      {/* Tax Details */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: colors.primary }}>Tax Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Wages & Compensation:</span>
            <span>{data.wages_tips_compensation_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>Federal Income Tax Withheld:</span>
            <span>{data.federal_income_tax_withheld_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>Social Security Wages:</span>
            <span>{data.social_security_wages_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>Social Security Tax Withheld:</span>
            <span>{data.social_security_tax_withheld_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>Medicare Wages:</span>
            <span>{data.medicare_wages_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>Medicare Tax Withheld:</span>
            <span>{data.medicare_tax_withheld_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>State Wages:</span>
            <span>{data.state_wages_fmt}</span>
          </div>
          <div className="flex justify-between">
            <span>State Income Tax:</span>
            <span>{data.state_income_tax_fmt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

