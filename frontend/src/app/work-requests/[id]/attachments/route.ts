import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const workRequestId = params.id
    const tenantId = formData.get('tenant_id') as string

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    // Verify user has access to this work request
    const { data: workRequest, error: wrError } = await supabase
      .from('work_requests')
      .select('id, tenant_id')
      .eq('id', workRequestId)
      .eq('tenant_id', tenantId)
      .single()

    if (wrError || !workRequest) {
      return NextResponse.json({ error: 'Work request not found' }, { status: 404 })
    }

    const uploadedAttachments = []

    // Upload each file
    for (const file of files) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        )
      }

      // Create unique file path: tenant_id/work_request_id/timestamp_filename
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${tenantId}/${workRequestId}/${timestamp}_${sanitizedFileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('work-request-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        )
      }

      // Save attachment record to database
      const { data: attachment, error: dbError } = await supabase
        .from('work_request_attachments')
        .insert({
          work_request_id: workRequestId,
          tenant_id: tenantId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: uploadData.path, // Store the storage path
          uploaded_by: user.id
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        // Cleanup: delete uploaded file if database insert fails
        await supabase.storage
          .from('work-request-attachments')
          .remove([filePath])
        
        return NextResponse.json(
          { error: `Failed to save ${file.name} record` },
          { status: 500 }
        )
      }

      uploadedAttachments.push(attachment)
    }

    return NextResponse.json({
      success: true,
      attachments: uploadedAttachments
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get attachments for a work request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workRequestId = params.id

    // Get attachments
    const { data: attachments, error } = await supabase
      .from('work_request_attachments')
      .select('*')
      .eq('work_request_id', workRequestId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate signed URLs for each attachment (for secure downloads)
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (attachment) => {
        const { data: signedUrlData } = await supabase.storage
          .from('work-request-attachments')
          .createSignedUrl(attachment.file_url, 60 * 60) // 1 hour expiry

        return {
          ...attachment,
          download_url: signedUrlData?.signedUrl || null
        }
      })
    )

    return NextResponse.json({ attachments: attachmentsWithUrls })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('attachmentId')

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 })
    }

    // Get attachment record.
    const { data: attachment, error: fetchError } = await supabase
      .from('work_request_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single()

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('work-request-attachments')
      .remove([attachment.file_url])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('work_request_attachments')
      .delete()
      .eq('id', attachmentId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}