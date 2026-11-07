import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/common/alert-dialog'
import { Button } from '@/components/common/button'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  disabled?: boolean
  desc: React.JSX.Element | string
  cancelBtnText?: string
  confirmText?: React.ReactNode
  destructive?: boolean
  handleConfirm: () => void
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    title,
    desc,
    children,
    className,
    confirmText,
    cancelBtnText,
    destructive,
    isLoading,
    disabled = false,
    handleConfirm,
    ...actions
  } = props
  return (
    <AlertDialog {...actions}>
      <AlertDialogContent
        className={cn(className && className)}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className='text-start'>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{desc}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText ?? 'Cancel'}
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={(e) => {
              // Prevent the confirm click from falling through to elements under the dialog
              // (e.g. attachment dropzone opening the file picker).
              e.preventDefault()
              e.stopPropagation()
              handleConfirm()
            }}
            disabled={disabled || isLoading}
          >
            {isLoading && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
            {confirmText ?? 'Continue'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
