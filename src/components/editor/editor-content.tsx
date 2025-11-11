'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from './markdown-editor'
import { MarkdownRenderer } from './markdown-renderer'
import type { Database } from '@/types/database.types'
type Project = Database['public']['Tables']['projects']['Row']
type Document = Database['public']['Tables']['documents']['Row']

interface EditorContentProps {
  project: Project
  documents: Document[]
}

export function EditorContent({ project, documents }: EditorContentProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [selectedId, setSelectedId] = useState<string | null>(
    documents[0]?.id || null
  )
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!documents.find((doc) => doc.id === selectedId)) {
      setSelectedId(documents[0]?.id || null)
    }
  }, [documents, selectedId])

  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedId) || null,
    [documents, selectedId]
  )

  async function handleGenerate() {
    if (!project.repository_url) {
      alert('Please add a repository URL to generate documentation')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: project.id,
          repositoryUrl: project.repository_url,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'Failed to generate documentation'
        throw new Error(message)
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate documentation')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleExportPDF() {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId: project.id }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'Failed to export PDF'
        throw new Error(message)
      }

      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export PDF')
    }
  }

  function handleAddSection() {
    const title = prompt('Section title')?.trim()
    if (!title) return

    setIsCreating(true)
    startTransition(async () => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            projectId: project.id,
            title,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          const message = data?.error || 'Failed to create section'
          throw new Error(message)
        }

        const { document } = await response.json()
        setSelectedId(document.id)
        router.refresh()
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create section')
      } finally {
        setIsCreating(false)
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-white">
        <div className="flex w-full items-center justify-between px-5 py-3">
          <a href="/dashboard" className="heading-xs text-foreground hover:text-primary transition-colors cursor-pointer">
            DocForge
          </a>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center rounded-lg px-4 py-2.5 transition-colors"
              onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
            >
              <span className="label-sm">{mode === 'view' ? 'Edit' : 'View'}</span>
            </Button>
            <Button
              size="sm"
              className="flex items-center rounded-lg px-4 py-2.5 transition-colors"
              onClick={handleExportPDF}
            >
              <span className="label-sm">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 bg-white">
        <aside className="hidden w-[188px] shrink-0 bg-white md:block">
          <div className="flex h-full flex-col px-3">
            <div className="sticky top-[70px] flex h-[calc(100vh-70px)] flex-col gap-4 px-0 pb-12">
              <div>
                <span className="label-sm text-muted-foreground pl-3">
                  Get started
                </span>
              </div>
              <nav className="flex-1 space-y-0">
                {documents.map((doc) => {
                  const isActive = doc.id === selectedId
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedId(doc.id)}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      <span className="label-sm">{doc.title}</span>
                    </button>
                  )
                })}
                {documents.length === 0 && (
                  <p className="paragraph-xs px-4 text-muted-foreground">
                    No sections yet. Click “Add Section”.
                  </p>
                )}
              </nav>
            </div>
          </div>
        </aside>

        <section className="mr-4 flex-1 rounded-[8px] bg-[#F6F8FA] px-[92px] pb-14 pt-6">
          <div className="sticky top-[76px] flex h-[calc(100vh-76px)] flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-3">
            {!selectedDocument ? (
                <div className="py-16 text-center paragraph-md text-muted-foreground">
                  Select a section to get started.
                </div>
              ) : mode === 'edit' ? (
                <MarkdownEditor
                  key={selectedDocument.id}
                  document={selectedDocument}
                  onSaved={() => {
                    setMode('view')
                    router.refresh()
                  }}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                    <h2 className="heading-xl text-foreground">{selectedDocument.title}</h2>
                      {project.description && (
                      <p className="mt-2 paragraph-md text-muted-foreground">{project.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <MarkdownRenderer
                      content={selectedDocument.content || ''}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

