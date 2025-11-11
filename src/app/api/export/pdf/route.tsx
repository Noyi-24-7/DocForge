import { NextRequest, NextResponse } from 'next/server'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'
import { getDocuments } from '@/app/actions/documents'
import { SupabaseStorageService } from '@/lib/storage/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get documents
    const documents = await getDocuments(projectId)
    const pdfBuffer = await generatePDFContent(project.name, documents)

    // Upload to storage
    const storage = new SupabaseStorageService()
    const fileName = `project-${projectId}-${Date.now()}.pdf`
    const path = `users/${user.id}/projects/${projectId}/${fileName}`

    await storage.upload({
      bucket: 'documents',
      path,
      file: Buffer.from(pdfBuffer),
      metadata: {
        projectId,
        generatedAt: new Date().toISOString(),
      },
    })

    // Get signed URL
    const url = await storage.getSignedUrl('documents', path, 3600)

    return NextResponse.json({ success: true, url, path })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generatePDFContent(projectName: string, documents: any[]) {
  const pdfDoc = await PDFDocument.create()
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595.28 // A4 width in points
  const pageHeight = 841.89 // A4 height in points
  const margin = 50
  const contentWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const baseColor = rgb(0.07, 0.09, 0.15)

  const ensureSpace = (lineHeight: number) => {
    if (y - lineHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }

  const drawLine = (text: string, font = bodyFont, fontSize = 12, indent = 0, lineHeight = fontSize + 4) => {
    ensureSpace(lineHeight)
    page.drawText(text, {
      x: margin + indent,
      y,
      size: fontSize,
      font,
      color: baseColor,
    })
    y -= lineHeight
  }

  const wrapText = (text: string, font = bodyFont, fontSize = 12, maxWidth = contentWidth) => {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(candidate, fontSize)
      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = candidate
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const drawParagraph = (text: string, indent = 0) => {
    const lines = wrapText(text, bodyFont, 12, contentWidth - indent)
    lines.forEach((line) => drawLine(line, bodyFont, 12, indent))
    if (!lines.length) {
      drawLine(' ', bodyFont, 12, indent)
    }
  }

  drawLine(`${projectName} Documentation`, headingFont, 20, 0, 26)
  y -= 10

  if (!documents.length) {
    drawParagraph('No documentation sections available yet.')
  }

  documents.forEach((section: any, index: number) => {
    if (index !== 0) {
      y -= 12
    }

    drawLine(section.title || `Section ${index + 1}`, headingFont, 16, 0, 22)
    y -= 6

    const rawContent = (section.content || '').replace(/\r\n/g, '\n')
    const lines = rawContent.split('\n')

    lines.forEach((line: string) => {
      const trimmed = line.trim()

      if (!trimmed) {
        y -= 8
        ensureSpace(0)
        return
      }

      if (/^###\s+/.test(trimmed)) {
        drawLine(trimmed.replace(/^###\s+/, ''), headingFont, 14, 0, 20)
        return
      }

      if (/^##\s+/.test(trimmed)) {
        drawLine(trimmed.replace(/^##\s+/, ''), headingFont, 15, 0, 21)
        return
      }

      if (/^#\s+/.test(trimmed)) {
        drawLine(trimmed.replace(/^#\s+/, ''), headingFont, 18, 0, 24)
        return
      }

      if (/^-\s+/.test(trimmed)) {
        const content = wrapText(trimmed.replace(/^-\s+/, ''), bodyFont, 12, contentWidth - 14)
        content.forEach((wrappedLine, idx) => {
          const prefix = idx === 0 ? '• ' : '  '
          drawLine(prefix + wrappedLine, bodyFont, 12, 14)
        })
        return
      }

      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
      if (orderedMatch) {
        const [_, order, text] = orderedMatch
        const content = wrapText(text, bodyFont, 12, contentWidth - 20)
        content.forEach((wrappedLine, idx) => {
          const prefix = idx === 0 ? `${order}. ` : '   '
          drawLine(prefix + wrappedLine, bodyFont, 12, 20)
        })
        return
      }

      drawParagraph(trimmed)
    })
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

