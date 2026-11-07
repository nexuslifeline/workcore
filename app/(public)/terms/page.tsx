import type { Metadata } from 'next'

import { LegalDocumentLayout } from '@/features/legal/components/legal-document-layout'
import { readLegalDocument } from '@/features/legal/lib/read-legal-document'
import { RenderLegalMarkdown } from '@/features/legal/lib/render-legal-markdown'

export const metadata: Metadata = {
  title: 'Terms of Service | Workcore',
}

export default async function TermsOfServicePage() {
  const markdown = await readLegalDocument('terms-of-service.md')

  return (
    <LegalDocumentLayout current='terms'>
      <RenderLegalMarkdown markdown={markdown} />
    </LegalDocumentLayout>
  )
}
