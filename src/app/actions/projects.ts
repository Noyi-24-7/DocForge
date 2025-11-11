'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { projectSchema, documentSchema } from '@/schemas/project.schema'
import { ValidationError, APIError } from '@/lib/errors'
import type { ProjectInput, DocumentInput } from '@/schemas/project.schema'

export async function createProject(input: ProjectInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  const validated = projectSchema.safeParse(input)
  if (!validated.success) {
    throw new ValidationError(
      'Invalid project data',
      validated.error.errors[0]?.path[0]?.toString()
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: validated.data.name,
      description: validated.data.description || null,
      repository_url: validated.data.repositoryUrl || null,
      methodology: validated.data.methodology || null,
    })
    .select()
    .single()

  if (error) {
    throw new APIError('Failed to create project', 500, 'DATABASE_ERROR')
  }

  revalidatePath('/dashboard')
  return data
}

export async function getProjects() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new APIError('Failed to fetch projects', 500, 'DATABASE_ERROR')
  }

  return data
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new APIError('Project not found', 404, 'NOT_FOUND')
  }

  return data
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  const validated = projectSchema.partial().safeParse(input)
  if (!validated.success) {
    throw new ValidationError('Invalid project data')
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      name: validated.data.name,
      description: validated.data.description,
      repository_url: validated.data.repositoryUrl,
      methodology: validated.data.methodology,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new APIError('Failed to update project', 500, 'DATABASE_ERROR')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/editor/${id}`)
  return data
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new APIError('Failed to delete project', 500, 'DATABASE_ERROR')
  }

  revalidatePath('/dashboard')
}

