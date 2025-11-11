import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/app/actions/projects'
import { getDocuments } from '@/app/actions/documents'
import { EditorContent } from '@/components/editor/editor-content'

export default async function EditorPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const project = await getProject(params.id)
  const documents = await getDocuments(params.id)

  return <EditorContent project={project} documents={documents} />
}

