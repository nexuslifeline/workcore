'use client'

import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export type ImageUploadResult = {
  url: string
  path: string
}

export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<ImageUploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = productId
    ? `products/${productId}/${timestamp}-${randomString}.${fileExt}`
    : `products/temp/${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function deleteProductImage(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from('shared-media').remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

export async function uploadSupplierImage(
  file: File,
  supplierId?: string
): Promise<ImageUploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = supplierId
    ? `suppliers/${supplierId}/${timestamp}-${randomString}.${fileExt}`
    : `suppliers/temp/${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function uploadCustomerImage(
  file: File,
  customerId?: string
): Promise<ImageUploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = customerId
    ? `customers/${customerId}/${timestamp}-${randomString}.${fileExt}`
    : `customers/temp/${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function uploadEmployeeImage(
  file: File,
  employeeId?: string
): Promise<ImageUploadResult> {
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = employeeId
    ? `employees/${employeeId}/${timestamp}-${randomString}.${fileExt}`
    : `employees/temp/${timestamp}-${randomString}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function uploadOrganizationImage(
  file: File,
  organizationId?: string
): Promise<ImageUploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = organizationId
    ? `organizations/${organizationId}/${timestamp}-${randomString}.${fileExt}`
    : `organizations/temp/${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function uploadProfileImage(
  file: File,
  userId?: string
): Promise<ImageUploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = userId
    ? `profiles/${userId}/${timestamp}-${randomString}.${fileExt}`
    : `profiles/temp/${timestamp}-${randomString}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('shared-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('shared-media').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}