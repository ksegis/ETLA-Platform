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
          reviewed_by: user_id,
          reviewed_at: now,
          // decline_reason: '...' (could be added later if UI provides it)
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
      const projectData = {
        tenant_id: workRequest.tenant_id,
        project_code: `WR-${workRequest.id.slice(0, 8)}-${timestamp}`, // Unique project code with timestamp
        project_name: workRequest.title || 'Untitled Project',
        project_title: workRequest.title,
        title: workRequest.title,
        priority: workRequest.priority,
        project_category: workRequest.category,
        estimated_budget: workRequest.estimated_budget,
        budget: workRequest.estimated_budget,
        planned_end_date: workRequest.required_completion_date,
        end_date: workRequest.required_completion_date,
        work_request_id: workRequest.id,
        charter_status: 'draft', // Initial charter status
        customer_id: workRequest.customer_id,
        business_case: workRequest.business_justification,
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

      // B. Project created successfully - NOW update work request status to 'approved' and then 'converted_to_project'
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

      // C. Final Update Work Request Status to 'converted_to_project'
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
