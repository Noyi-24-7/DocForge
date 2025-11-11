'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateDocument } from '@/app/actions/documents'
import { MarkdownRenderer } from './markdown-renderer'
import type { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']

interface MarkdownEditorProps {
  document: Document
  onSaved?: () => void
}

export function MarkdownEditor({ document: initialDocument, onSaved }: MarkdownEditorProps) {
  const [document, setDocument] = useState(initialDocument)
  const [content, setContent] = useState(document.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSave() {
    setIsSaving(true)
    try {
      const updated = await updateDocument(document.id, { content })
      setDocument(updated)
      onSaved?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const applyInlineFormat = (prefix: string, suffix: string = prefix, placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart, selectionEnd } = textarea
    const value = content
    const selected = value.slice(selectionStart, selectionEnd) || placeholder
    const newValue =
      value.slice(0, selectionStart) +
      `${prefix}${selected}${suffix}` +
      value.slice(selectionEnd)

    setContent(newValue)

    requestAnimationFrame(() => {
      const pos = selectionStart + prefix.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos + selected.length)
    })
  }

  const applyLinePrefix = (prefix: string, toggle = true, ordered = false) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const value = content

    const selectionHasText = selectionEnd > selectionStart

    const startLine = value.lastIndexOf('\n', selectionStart - 1) + 1
    const endLineIndex = selectionHasText
      ? value.indexOf('\n', selectionEnd)
      : value.indexOf('\n', selectionStart)
    const endLine = endLineIndex === -1 ? value.length : endLineIndex

    const selectionText =
      selectionHasText ? value.slice(selectionStart, selectionEnd) : value.slice(startLine, endLine)

    const lines = selectionText.split('\n')
    const allPrefixed = lines.every((line) => line.startsWith(prefix))

    const updatedLines = lines.map((line, idx) => {
      if (ordered) {
        const currentNumber = `${idx + 1}. `
        if (line.match(/^\d+\.\s/)) {
          return line.replace(/^\d+\.\s/, currentNumber)
        }
        return `${currentNumber}${line}`
      }

      if (toggle && allPrefixed) {
        return line.replace(prefix, '')
      }

      if (line.startsWith(prefix)) {
        return line
      }
      return `${prefix}${line}`
    })

    const replacement = updatedLines.join('\n')
    const newValue = selectionHasText
      ? value.slice(0, selectionStart) + replacement + value.slice(selectionEnd)
      : value.slice(0, startLine) + replacement + value.slice(endLine)

    setContent(newValue)

    requestAnimationFrame(() => {
      const start = selectionHasText ? selectionStart : startLine
      const end = start + replacement.length
      textarea.focus()
      textarea.setSelectionRange(start, end)
    })
  }

  const handleLink = () => {
    const url = window.prompt('Enter URL')
    if (!url) return
    applyInlineFormat('[', `](${url})`, 'link text')
  }

  const formattingButtons = [
    {
      label: 'H1',
      onClick: () => applyLinePrefix('# ', false),
      tooltip: 'Heading 1',
    },
    {
      label: 'H2',
      onClick: () => applyLinePrefix('## ', false),
      tooltip: 'Heading 2',
    },
    {
      label: 'H3',
      onClick: () => applyLinePrefix('### ', false),
      tooltip: 'Heading 3',
    },
    {
      label: 'Bold',
      onClick: () => applyInlineFormat('**', '**', 'bold text'),
      tooltip: 'Bold',
    },
    {
      label: 'Italic',
      onClick: () => applyInlineFormat('_', '_', 'italic text'),
      tooltip: 'Italic',
    },
    {
      label: 'Link',
      onClick: handleLink,
      tooltip: 'Insert link',
    },
    {
      label: 'List',
      onClick: () => applyLinePrefix('- '),
      tooltip: 'Bulleted list',
    },
    {
      label: 'Numbered',
      onClick: () => applyLinePrefix('', false, true),
      tooltip: 'Numbered list',
    },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b p-4 bg-muted/50 flex justify-between items-center">
        <h2 className="heading-xs">{document.title}</h2>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div className="grid md:grid-cols-2 h-[600px]">
        <div className="border-r flex flex-col">
          <div className="border-b bg-muted/40 px-3 py-2 flex flex-wrap gap-2">
            {formattingButtons.map((button) => (
              <Button
                key={button.label}
                size="sm"
                variant="secondary"
                onClick={button.onClick}
                title={button.tooltip}
              >
                {button.label}
              </Button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="w-full flex-1 resize-none mono-sm focus:outline-none p-4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your documentation in Markdown..."
          />
        </div>
        <div className="p-4 overflow-y-auto">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  )
}

