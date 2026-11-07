'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
  displayName: string
  onDelete: (id: string) => Promise<void>
  // Entity configuration
  entityName?: string
  entityNameLower?: string
  // Customizable messages
  title?: React.ReactNode
  description?: React.JSX.Element | string
  successMessage?: string
  errorMessage?: string
  confirmText?: string
  // Query invalidation
  queryKey?: string[]
  onSuccess?: () => void
  onError?: (error: Error) => void
  // Additional customization
  className?: string
  destructive?: boolean
}

export function DeleteDialog({
  open,
  onOpenChange,
  id,
  displayName,
  onDelete,
  entityName = 'Item',
  entityNameLower = 'item',
  title,
  description,
  successMessage,
  errorMessage,
  confirmText = 'Delete',
  queryKey,
  onSuccess,
  onError,
  className,
  destructive = false,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(id)
      const message = successMessage || `${entityName} deleted successfully`
      toast.success(message)
      onOpenChange(false)
      
      // Invalidate queries if provided
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
      
      // Call custom success handler if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = errorMessage || 
        (error instanceof Error ? error.message : `Failed to delete ${entityNameLower}`)
      toast.error(message)
      
      // Call custom error handler if provided
      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Default title
  const defaultTitle = (
    <span className='text-foreground'>
      Delete {entityName}
    </span>
  )

  // Default description
  const defaultDescription: React.JSX.Element = (
    <p className='text-foreground'>
      Are you sure you want to delete{' '}
      <span className='font-bold'>{displayName}</span>?
    </p>
  )

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting}
      isLoading={isDeleting}
      title={title || defaultTitle}
      desc={description || defaultDescription}
      confirmText={confirmText}
      destructive={destructive}
      className={className}
    />
  )
}
