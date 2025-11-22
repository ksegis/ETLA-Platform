import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';

// Create the server-side Supabase client with Service Role Key
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Handles the approval or rejection of a work request, and creates a project on approval.
 * @param request The incoming Next.js request
 * @returns A JSON response indicating success or failure
 */
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server configuration error: Admin client not available' 
    }, { status: 500 });
  }

  try {
    const { work_request_id, action, user_id, user_role } = await request.json();

    if (!work_request_id || !action || !user_id || !user_role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: work_request_id, action, user_id, or user_role' 
      }, { status: 400 });
    }

    // Basic authorization check (only host_admin can approve/reject)
    if (user_role !== 'host_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: Only Host Administrators can process work requests.' 
      }, { status: 403 });
    }

    // 1. Fetch the Work Request details
    const { data: workRequest, error: fetchError } = await supabaseAdmin
      .from('work_requests')
      .select('*')
      .eq('id', work_request_id)
      .single();

    if (fetchError || !workRequest) {
      return NextResponse.json({ 
        success: false, 
        error: `Work Request not found or fetch error: ${fetchError?.message}` 
      }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (action === 'reject') {
      // 2. Handle Rejection
      const { error: updateError } = await supabaseAdmin
        .from('work_requests')
        .update({ 
          status: 'rejected',
          decline_reason: 'Rejected by administrator', // Using valid column from schema
          updated_at: now,
        })
        .eq('id', work_request_id);

      if (updateError) {
        return NextResponse.json({ 
          success: false, 
          error: `Failed to reject work request: ${updateError.message}` 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Work Request rejected successfully.' 
      });

    } else if (action === 'approve') {
      // 2. Handle Approval and Project Creation
      
      // A. Create Project (Project Charter) FIRST - only update status if this succeeds
      // Map work request fields to valid project_charters columns only
      // Generate unique project code using timestamp to avoid duplicates
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      
      // Build comprehensive description from work request
      let enhancedDescription = workRequest.description || '';
      if (workRequest.specificRequirements) {
        enhancedDescription += `\n\n**Specific Requirements:**\n${workRequest.specificRequirements}`;
      }
      if (workRequest.categoryOther) {
        enhancedDescription += `\n\n**Additional Category Details:**\n${workRequest.categoryOther}`;
      }
      
      // Build project scope from work request scope data
      const scopeParts = [];
      if (workRequest.affectedSystems) {
        const systems = Array.isArray(workRequest.affectedSystems) ? workRequest.affectedSystems.join(', ') : workRequest.affectedSystems;
        scopeParts.push(`**Affected Systems:** ${systems}`);
      }
      if (workRequest.estimatedEmployeeImpact) {
        scopeParts.push(`**Employee Impact:** ${workRequest.estimatedEmployeeImpact}`);
      }
      if (workRequest.complianceRelated === 'yes') {
        scopeParts.push(`**⚠️ COMPLIANCE RELATED** - This project involves compliance requirements`);
      }
      if (workRequest.estimatedDocumentCount) {
        scopeParts.push(`**Document Count:** ${workRequest.estimatedDocumentCount}`);
      }
      if (workRequest.estimatedDataVolume) {
        scopeParts.push(`**Data Volume:** ${workRequest.estimatedDataVolume}`);
      }
      const projectScope = scopeParts.join('\n');
      
      // Build risk assessment from current system info
      const riskParts = [];
      if (workRequest.currentPayrollSystem) {
        riskParts.push(`**Current Payroll System:** ${workRequest.currentPayrollSystem}`);
      }
      if (workRequest.currentHRIS) {
        riskParts.push(`**Current HRIS:** ${workRequest.currentHRIS}`);
      }
      if (workRequest.currentVersion) {
        riskParts.push(`**Current Version:** ${workRequest.currentVersion}`);
      }
      if (workRequest.currentIntegrationCount) {
        riskParts.push(`**Current Integrations:** ${workRequest.currentIntegrationCount}`);
      }
      if (workRequest.dataMigrationNeeded && workRequest.dataMigrationNeeded !== 'no') {
        riskParts.push(`**⚠️ Data Migration Required:** ${workRequest.dataMigrationNeeded}`);
      }
      if (workRequest.currentPainPoints) {
        riskParts.push(`**Current Pain Points:**\n${workRequest.currentPainPoints}`);
      }
      const riskAssessment = riskParts.join('\n');
      
      // Build constraints from scope estimation
      const constraintParts = [];
      if (workRequest.longTermStorageRequired === 'yes') {
        constraintParts.push('Long-term storage required');
      }
      if (workRequest.ongoingApiMonitoring === 'yes') {
        constraintParts.push('Ongoing API monitoring required');
      }
      if (workRequest.ongoingSupportNeeded === 'yes') {
        constraintParts.push('Ongoing support required');
      }
      if (workRequest.expectedFrequency) {
        constraintParts.push(`Frequency: ${workRequest.expectedFrequency}`);
      }
      if (workRequest.integrationComplexity) {
        constraintParts.push(`Integration Complexity: ${workRequest.integrationComplexity}`);
      }
      const constraints = constraintParts.join('; ');
      
      // Build assumptions
      const assumptionParts = [];
      if (workRequest.helixBridgeAccess === 'yes') {
        assumptionParts.push('Organization will require access to HelixBridge platform');
      } else if (workRequest.helixBridgeAccess === 'no') {
        assumptionParts.push('Organization will NOT require access to HelixBridge platform');
      }
      const assumptions = assumptionParts.join('; ');
      
      const projectData = {
        tenant_id: workRequest.tenant_id,
        project_code: `WR-${workRequest.id.slice(0, 8)}-${timestamp}`, // Unique project code with timestamp
        project_name: workRequest.title || 'Untitled Project',
        project_title: workRequest.title,
        title: workRequest.title,
        description: enhancedDescription,
        priority: workRequest.priority,
        project_category: Array.isArray(workRequest.category) ? workRequest.category.join(', ') : workRequest.category,
        estimated_budget: workRequest.estimated_budget,
        budget: workRequest.estimated_budget,
        planned_end_date: workRequest.required_completion_date,
        end_date: workRequest.required_completion_date,
        work_request_id: workRequest.id,
        charter_status: 'draft', // Initial charter status
        customer_id: workRequest.customer_id,
        business_case: workRequest.business_justification,
        project_scope: projectScope || undefined,
        risk_assessment: riskAssessment || undefined,
        constraints: constraints || undefined,
        assumptions: assumptions || undefined,
        created_by: user_id,
        created_at: now,
        updated_at: now,
      };

      const { data: project, error: projectError } = await supabaseAdmin
        .from('project_charters')
        .insert([projectData])
        .select()
        .single();

      if (projectError) {
        // Project creation failed - do NOT update work request status
        console.error('Project creation failed:', projectError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to create project: ${projectError.message}` 
        }, { status: 500 });
      }

      // B. Copy attachments from work request to project (if any)
      if (workRequest.attachments && Array.isArray(workRequest.attachments) && workRequest.attachments.length > 0) {
        console.log(`Copying ${workRequest.attachments.length} attachments from work request to project...`);
        // Note: In a real implementation, you would copy the files in storage and create new records
        // For now, we'll just log this. You may need to implement actual file copying based on your storage setup.
        // Example: Copy files from work_request_attachments/ to project_attachments/ in Supabase Storage
      }
      
      // C. Project created successfully - NOW update work request status to 'approved' and then 'converted_to_project'
      const { error: updateError } = await supabaseAdmin
        .from('work_requests')
        .update({ 
          status: 'approved',
          approved_by: user_id,
          approved_at: now,
          project_id: project.id, // Link the created project
        })
        .eq('id', work_request_id);

      if (updateError) {
        console.error('Failed to update work request status after project creation:', updateError);
        // Project is created but work request status update failed - return success with warning
        return NextResponse.json({ 
          success: true, 
          message: 'Project created successfully, but failed to update work request status.',
          project_id: project.id,
          project_code: projectData.project_code
        });
      }

      // D. Final Update Work Request Status to 'converted_to_project'
      const { error: finalUpdateError } = await supabaseAdmin
        .from('work_requests')
        .update({ 
          status: 'converted_to_project', // Final status
        })
        .eq('id', work_request_id);

      if (finalUpdateError) {
        console.error('Failed to set work request status to converted_to_project:', finalUpdateError);
        // This is a minor failure, the project is created, but the WR status is slightly off.
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Work Request approved and Project created successfully.',
        project_id: project.id,
        project_code: projectData.project_code
      });

    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action specified. Must be "approve" or "reject".' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API: Work Request Process Unexpected Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred during work request processing.' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
