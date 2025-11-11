'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']

interface DashboardContentProps {
  projects: Project[]
}

export function DashboardContent({ projects }: DashboardContentProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="heading-md text-foreground">DocForge</h1>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/new">
              <Button>New Project</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="heading-lg mb-2">Your Projects</h2>
          <p className="paragraph-md text-muted-foreground">
            Manage and generate documentation for your projects
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="paragraph-md text-muted-foreground mb-4">
                You don&apos;t have any projects yet.
              </p>
              <Link href="/dashboard/new">
                <Button>Create Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2 text-muted-foreground">
                    {project.repository_url && (
                      <p className="paragraph-sm">Repository: {project.repository_url}</p>
                    )}
                    <p className="paragraph-sm">Created: {formatDate(project.created_at)}</p>
                  </div>
                  <Link href={`/editor/${project.id}`}>
                    <Button className="w-full">Open Editor</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

