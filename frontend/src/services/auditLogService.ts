/**
 * Audit Log Service
 * Tracks sensitive operations for compliance and security
 */

import { supabase } from '@/lib/supabase';

export type AuditAction = 
  | 'CANDIDATE_EXPORT'
  | 'CANDIDATE_VIEW'
  | 'CANDIDATE_CREATE'
  | 'CANDIDATE_UPDATE'
  | 'CANDIDATE_DELETE'
  | 'FILTER_SAVE'
  | 'FILTER_DELETE'
  | 'DOCUMENT_ACCESS';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  tenant_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  userId: string,
  tenantId: string,
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // In a real implementation, this would write to an audit_logs table
    // For now, we'll log to console and could write to Supabase
    
    const auditEntry: AuditLogEntry = {
      user_id: userId,
      tenant_id: tenantId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      created_at: new Date().toISOString()
    };

    console.log('[AUDIT LOG]', auditEntry);

    // Uncomment when audit_logs table is created
    /*
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntry);

    if (error) {
      console.error('Failed to write audit log:', error);
    }
    */
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging should never break the main flow
  }
}

/**
 * Log candidate export
 */
export async function logCandidateExport(
  userId: string,
  tenantId: string,
  exportFormat: 'excel' | 'pdf' | 'csv',
  candidateCount: number,
  includesSalary: boolean,
  filterDescription?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    tenantId,
    'CANDIDATE_EXPORT',
    'candidates',
    undefined,
    {
      format: exportFormat,
      candidate_count: candidateCount,
      includes_salary: includesSalary,
      filter_description: filterDescription
    }
  );
}

/**
 * Log document access
 */
export async function logDocumentAccess(
  userId: string,
  tenantId: string,
  candidateId: string,
  documentName: string
): Promise<void> {
  await logAuditEvent(
    userId,
    tenantId,
    'DOCUMENT_ACCESS',
    'candidate_document',
    candidateId,
    {
      document_name: documentName
    }
  );
}

/**
 * Log saved filter operations
 */
export async function logFilterOperation(
  userId: string,
  tenantId: string,
  operation: 'save' | 'delete',
  filterName: string
): Promise<void> {
  await logAuditEvent(
    userId,
    tenantId,
    operation === 'save' ? 'FILTER_SAVE' : 'FILTER_DELETE',
    'saved_filter',
    undefined,
    {
      filter_name: filterName
    }
  );
}
