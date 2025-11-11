import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="heading-md text-foreground">DocForge</h1>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h2 className="heading-xl">
            AI-Powered Documentation Generator
          </h2>
          <p className="paragraph-lg text-muted-foreground">
            Automatically generate comprehensive documentation websites and PDF manuals
            for any software project by analyzing its codebase, reports, and integration workflows.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">
                Connect GitHub
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Connect Repository</CardTitle>
                <CardDescription>
                  Link your GitHub repo or upload project files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="paragraph-sm text-muted-foreground">
                  DocForge analyzes your codebase structure, dependencies, and workflows
                  to understand your project architecture.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Generation</CardTitle>
                <CardDescription>
                  Automatic documentation creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="paragraph-sm text-muted-foreground">
                  Our AI engine generates comprehensive documentation including setup guides,
                  architecture explanations, API documentation, and deployment instructions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edit & Export</CardTitle>
                <CardDescription>
                  Customize and export as PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="paragraph-sm text-muted-foreground">
                  Use our built-in markdown editor to refine documentation, then export
                  as a professional PDF manual for your team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center paragraph-sm text-muted-foreground">
          <p>© 2024 DocForge. Built with Next.js, Supabase, and OpenAI.</p>
        </div>
      </footer>
    </div>
  )
}

