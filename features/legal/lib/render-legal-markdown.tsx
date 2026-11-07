import { Fragment, type ReactNode } from 'react'

type HeadingBlock = {
  type: 'h1' | 'h2' | 'h3'
  text: string
}

type ParagraphBlock = {
  type: 'p'
  text: string
}

type ListBlock = {
  type: 'ul' | 'ol'
  items: string[]
}

type MarkdownBlock = HeadingBlock | ParagraphBlock | ListBlock

function renderLinks(text: string, keyOffset: number): ReactNode[] {
  const parts: ReactNode[] = []
  const urlPattern = /https?:\/\/[^\s]+/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = keyOffset

  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const href = match[0]
    parts.push(
      <a
        key={key}
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='underline underline-offset-4 hover:text-primary'
      >
        {href}
      </a>
    )
    key += 1
    lastIndex = match.index + href.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  const boldPattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderLinks(text.slice(lastIndex, match.index), key))
      key += 1
    }
    parts.push(<strong key={`b-${key}`}>{match[1]}</strong>)
    key += 1
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(...renderLinks(text.slice(lastIndex), key))
  }

  if (parts.length === 0) return text
  if (parts.length === 1) return parts[0]

  return parts.map((part, index) => (
    <Fragment key={index}>{part}</Fragment>
  ))
}

function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      index += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      index += 1
      continue
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) })
      index += 1
      continue
    }

    if (/^\* /.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\* /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2))
        index += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ''))
        index += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    blocks.push({ type: 'p', text: trimmed })
    index += 1
  }

  return blocks
}

export function RenderLegalMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseBlocks(markdown)

  return (
    <div className='space-y-4 text-sm leading-relaxed text-foreground sm:text-[0.9375rem]'>
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return (
            <h1
              key={index}
              className='text-3xl font-semibold tracking-tight text-foreground'
            >
              {renderInline(block.text)}
            </h1>
          )
        }

        if (block.type === 'h2') {
          return (
            <h2
              key={index}
              className='pt-4 text-lg font-semibold tracking-tight text-foreground'
            >
              {renderInline(block.text)}
            </h2>
          )
        }

        if (block.type === 'h3') {
          return (
            <h3
              key={index}
              className='pt-2 text-base font-semibold text-foreground'
            >
              {renderInline(block.text)}
            </h3>
          )
        }

        if (block.type === 'ul') {
          return (
            <ul
              key={index}
              className='list-disc space-y-1 pl-5 text-muted-foreground'
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className='text-foreground'>
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ol') {
          return (
            <ol
              key={index}
              className='list-decimal space-y-1 pl-5 text-muted-foreground'
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className='text-foreground'>
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          )
        }

        if (block.type === 'p') {
          return (
            <p key={index} className='text-foreground'>
              {renderInline(block.text)}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}
