import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewProjectForm } from '@/components/dashboard/new-project-form'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="heading-md text-foreground">DocForge</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h2 className="heading-lg mb-8">Create New Project</h2>
        <NewProjectForm />
      </main>
    </div>
  )
}

