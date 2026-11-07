import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type LegalDocumentFile = 'terms-of-service.md' | 'privacy-policy.md'

export async function readLegalDocument(filename: LegalDocumentFile) {
  const filePath =
    filename === 'terms-of-service.md'
      ? path.join(process.cwd(), 'content', 'legal', 'terms-of-service.md')
      : path.join(process.cwd(), 'content', 'legal', 'privacy-policy.md')

  return readFile(filePath, 'utf8')
}
