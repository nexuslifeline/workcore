import type { Metadata } from 'next'

import { LegalDocumentLayout } from '@/features/legal/components/legal-document-layout'
import { readLegalDocument } from '@/features/legal/lib/read-legal-document'
import { RenderLegalMarkdown } from '@/features/legal/lib/render-legal-markdown'

export const metadata: Metadata = {
  title: 'Privacy Policy | Workcore',
}

export default async function PrivacyPolicyPage() {
  const markdown = await readLegalDocument('privacy-policy.md')

  return (
    <LegalDocumentLayout current='privacy'>
      <RenderLegalMarkdown markdown={markdown} />
    </LegalDocumentLayout>
  )
}
