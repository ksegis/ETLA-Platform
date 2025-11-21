// API Route: /api/talent-import/confirm
// Purpose: Log tenant confirmation actions to database for audit trail

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      sessionKey,
      importType,
      confirmationStage, // 'upload', 'review', 'final'
      confirmationType, // 'tenant_selection', 'tenant_verification', 'final_approval'
      promptText,
      selectedTenantId,
      selectedTenantName,
      recordCount,
      documentCount,
      metadata,
    } = body;

    // Validate required fields
    if (!sessionKey || !importType || !confirmationStage || !confirmationType || !promptText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get or create import session
    let sessionId: string;
    
    const { data: existingSession } = await supabase
      .from('talent_import_sessions')
      .select('id')
      .eq('session_key', sessionKey)
      .single();

    if (existingSession) {
      sessionId = existingSession.id;
      
      // Update session with confirmation timestamp
      const updateField = `confirmed_at_${confirmationStage}`;
      const confirmationTextField = `${confirmationStage}_confirmation_text`;
      
      await supabase
        .from('talent_import_sessions')
        .update({
          [updateField]: new Date().toISOString(),
          [confirmationTextField]: promptText,
          target_tenant_id: selectedTenantId || undefined,
          target_tenant_name: selectedTenantName || undefined,
          total_records: recordCount || undefined,
          total_documents: documentCount || undefined,
        })
        .eq('id', sessionId);
    } else {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('talent_import_sessions')
        .insert({
          session_key: sessionKey,
          import_type: importType,
          user_id: user.id,
          user_email: user.email,
          user_role: user.user_metadata?.role || 'unknown',
          target_tenant_id: selectedTenantId || null,
          target_tenant_name: selectedTenantName || null,
          total_records: recordCount || null,
          total_documents: documentCount || null,
          [`confirmed_at_${confirmationStage}`]: new Date().toISOString(),
          [`${confirmationStage}_confirmation_text`]: promptText,
          ip_address: ipAddress,
          user_agent: userAgent,
          import_status: 'pending',
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json(
          { error: 'Failed to create import session' },
          { status: 500 }
        );
      }

      sessionId = newSession.id;
    }

    // Log confirmation detail
    const { error: logError } = await supabase
      .from('talent_import_confirmation_log')
      .insert({
        session_id: sessionId,
        confirmation_stage: confirmationStage,
        confirmation_type: confirmationType,
        prompt_text: promptText,
        user_response: 'confirmed',
        selected_tenant_id: selectedTenantId || null,
        selected_tenant_name: selectedTenantName || null,
        metadata: metadata || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (logError) {
      console.error('Error logging confirmation:', logError);
      return NextResponse.json(
        { error: 'Failed to log confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Confirmation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve confirmation status
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session key from query params
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    if (!sessionKey) {
      return NextResponse.json(
        { error: 'Session key required' },
        { status: 400 }
      );
    }

    // Get session with confirmations
    const { data: session, error } = await supabase
      .from('talent_import_sessions')
      .select('*')
      .eq('session_key', sessionKey)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check which confirmations are complete
    const confirmations = {
      upload: !!session.confirmed_at_upload,
      review: !!session.confirmed_at_review,
      final: !!session.confirmed_at_final,
    };

    const allConfirmed = confirmations.upload && confirmations.review && confirmations.final;

    return NextResponse.json({
      sessionId: session.id,
      confirmations,
      allConfirmed,
      targetTenant: {
        id: session.target_tenant_id,
        name: session.target_tenant_name,
      },
      recordCount: session.total_records,
      documentCount: session.total_documents,
    });

  } catch (error) {
    console.error('Confirmation status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
