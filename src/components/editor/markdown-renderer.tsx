'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import type { Components } from 'react-markdown'
import type { Pluggable } from 'unified'

const remarkPlugins: Pluggable[] = [remarkGfm, remarkBreaks as unknown as Pluggable]

const components: Components = {
  p: ({ children }) => (
    <p className="paragraph-md mb-4 last:mb-0">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="heading-xl mt-6 mb-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="heading-lg mt-6 mb-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="heading-md mt-5 mb-2 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="heading-sm mt-4 mb-2 first:mt-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="heading-xs mt-3 mb-1 first:mt-0">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="label-sm mt-2 mb-1 first:mt-0">{children}</h6>
  ),
  ul: ({ children }) => (
    <ul className="paragraph-md mb-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="paragraph-md mb-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="mono-xs rounded bg-muted px-1 py-[2px]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mono-sm mb-4 overflow-x-auto rounded bg-muted p-4">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a href={href} className="text-primary underline underline-offset-4">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="paragraph-md border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <table className="paragraph-sm min-w-full divide-y divide-gray-200 mb-4">
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th className="label-xs px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="paragraph-sm px-6 py-4 whitespace-nowrap text-gray-900">
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-t border-gray-200" />,
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={remarkPlugins}
      components={components}
    >
      {content || '*No content yet*'}
    </ReactMarkdown>
  )
}
