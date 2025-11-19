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
      
      // A. Update Work Request Status to 'approved'
      const { error: updateError } = await supabaseAdmin
        .from('work_requests')
        .update({ 
          status: 'approved',
          approved_by: user_id,
          approved_at: now,
        })
        .eq('id', work_request_id);

      if (updateError) {
        return NextResponse.json({ 
          success: false, 
          error: `Failed to approve work request: ${updateError.message}` 
        }, { status: 500 });
      }

      // B. Create Project (Project Charter)
      const projectData = {
        tenant_id: workRequest.tenant_id,
        project_name: `Project: ${workRequest.title}`,
        project_title: `Project: ${workRequest.title}`,
        // description field does not exist in project_charters table
        priority: workRequest.priority,
        project_category: workRequest.category,
        estimated_budget: workRequest.estimated_budget,
        end_date: workRequest.required_completion_date,
        work_request_id: workRequest.id,
        status: 'submitted', // Initial project status
        created_at: now,
        updated_at: now,
        // Map other relevant fields
        customer_id: workRequest.customer_id,
        business_case: workRequest.business_justification,
        // ... other fields as needed
      };

      const { data: project, error: projectError } = await supabaseAdmin
        .from('project_charters')
        .insert([projectData])
        .select()
        .single();

      if (projectError) {
        // Log error and potentially revert work request status if project creation fails
        console.error('Project creation failed:', projectError);
        // NOTE: For simplicity, we skip transaction rollback, but in production, this should be a transaction.
        return NextResponse.json({ 
          success: false, 
          error: `Failed to create project: ${projectError.message}` 
        }, { status: 500 });
      }

      // C. Final Update Work Request Status to 'converted_to_project'
      const { error: finalUpdateError } = await supabaseAdmin
        .from('work_requests')
        .update({ 
          status: 'converted_to_project',
          // Optionally link project ID back to work request if schema supports it
          // project_id: project.id, 
        })
        .eq('id', work_request_id);

      if (finalUpdateError) {
        console.error('Failed to set work request status to converted_to_project:', finalUpdateError);
        // This is a minor failure, the project is created, but the WR status is slightly off.
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Work Request approved and Project created successfully.',
        project_id: project.id
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
