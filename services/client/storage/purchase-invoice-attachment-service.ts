'use client'

import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
]

export type PurchaseInvoiceAttachmentUploadResult = {
  url: string
  path: string
  fileName: string
  fileSize: number
  contentType: string
}

export function validatePurchaseInvoiceAttachmentFile(file: File): void {
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed: PDF, images, Word, Excel, text, CSV.`
    )
  }
}

export async function uploadPurchaseInvoiceAttachment(
  file: File,
  organizationId: string,
  purchaseInvoiceId: string
): Promise<PurchaseInvoiceAttachmentUploadResult> {
  validatePurchaseInvoiceAttachmentFile(file)

  const supabase = createClient()
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `purchase-invoices/${organizationId}/${purchaseInvoiceId}/${timestamp}-${randomString}-${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
  }
}

export async function deletePurchaseInvoiceAttachmentFile(path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from('shared-media').remove([path])
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/** Build public URL for downloading an attachment (storage path from API). */
export function getPurchaseInvoiceAttachmentDownloadUrl(storagePath: string): string {
  if (typeof window !== 'undefined') {
    const supabase = createClient()
    const { data } = supabase.storage.from('shared-media').getPublicUrl(storagePath)
    return data.publicUrl
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${base}/storage/v1/object/public/shared-media/${storagePath}`
}
