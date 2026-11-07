'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ImageUploadResult = {
  url: string
  path: string
}

type ImageUploadProps = {
  value?: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<ImageUploadResult>
  name?: string
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  accept?: string
  maxSizeMB?: number
}

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  name = 'Image',
  label,
  disabled = false,
  size = 'md',
  className,
  accept = 'image/*',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Set preview when value changes (for edit mode)
  useEffect(() => {
    if (value && !imageFile) {
      setImagePreview(value)
    } else if (!value) {
      setImagePreview(null)
    }
  }, [value, imageFile])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`)
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload image
    setIsUploading(true)
    try {
      const result = await onUpload(file)
      onChange(result.url)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      )
      setImageFile(null)
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    setImageFile(null)
    setImagePreview(null)
    // Use null to properly clear the value
    onChange(null)
  }

  const sizeClass = sizeClasses[size]

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2'>
          {label}
        </label>
      )}
      <div className='relative group inline-block'>
        <input
          type='file'
          accept={accept}
          onChange={handleImageChange}
          disabled={isUploading || disabled}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed'
          id={`image-upload-${name.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg overflow-hidden transition-all',
            'bg-muted/30 hover:bg-muted/50',
            'border-muted-foreground/25 hover:border-muted-foreground/50',
            sizeClass,
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt={`${name} preview`}
                className='w-full h-full object-cover'
              />
              {!disabled && (
                <div 
                  className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-20 pointer-events-none'
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    disabled={isUploading || disabled}
                    className='opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-destructive pointer-events-auto'
                    aria-label='Remove image'
                  >
                    <Trash2 className='h-6 w-6' />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center h-full p-2'>
              {isUploading ? (
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              ) : (
                !disabled && (
                  <div className='flex flex-col items-center justify-center gap-1'>
                    <Upload className='h-6 w-6 text-muted-foreground' />
                    <span className='text-[10px] text-muted-foreground'>Upload</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
