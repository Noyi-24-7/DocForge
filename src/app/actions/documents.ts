'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { documentSchema } from '@/schemas/project.schema'
import { ValidationError, APIError } from '@/lib/errors'
import type { DocumentInput } from '@/schemas/project.schema'

export async function createDocument(projectId: string, input: DocumentInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    throw new APIError('Project not found', 404, 'NOT_FOUND')
  }

  const validated = documentSchema.safeParse(input)
  if (!validated.success) {
    throw new ValidationError('Invalid document data')
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      project_id: projectId,
      title: validated.data.title,
      content: validated.data.content || null,
      type: validated.data.type || null,
      order_index: validated.data.orderIndex || null,
    })
    .select()
    .single()

  if (error) {
    throw new APIError('Failed to create document', 500, 'DATABASE_ERROR')
  }

  revalidatePath(`/editor/${projectId}`)
  return data
}

export async function getDocuments(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    throw new APIError('Project not found', 404, 'NOT_FOUND')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    throw new APIError('Failed to fetch documents', 500, 'DATABASE_ERROR')
  }

  return data
}

export async function updateDocument(id: string, input: Partial<DocumentInput>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  // Verify document ownership through project
  const { data: document } = await supabase
    .from('documents')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  if (!document || (document.projects as any).user_id !== user.id) {
    throw new APIError('Document not found', 404, 'NOT_FOUND')
  }

  const validated = documentSchema.partial().safeParse(input)
  if (!validated.success) {
    throw new ValidationError('Invalid document data')
  }

  const { data, error } = await supabase
    .from('documents')
    .update({
      title: validated.data.title,
      content: validated.data.content,
      type: validated.data.type,
      order_index: validated.data.orderIndex,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new APIError('Failed to update document', 500, 'DATABASE_ERROR')
  }

  revalidatePath(`/editor/${document.project_id}`)
  return data
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  // Verify document ownership
  const { data: document } = await supabase
    .from('documents')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  if (!document || (document.projects as any).user_id !== user.id) {
    throw new APIError('Document not found', 404, 'NOT_FOUND')
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)

  if (error) {
    throw new APIError('Failed to delete document', 500, 'DATABASE_ERROR')
  }

  revalidatePath(`/editor/${document.project_id}`)
}

