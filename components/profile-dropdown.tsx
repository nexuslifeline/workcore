'use client'

import * as React from 'react'
import Link from 'next/link'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar } from '@/components/common/avatar'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { ConfigDrawer } from '@/components/config-drawer'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useProfile } from '@/hooks/use-profile'
import { AvatarSkeleton } from '@/components/common/skeletons'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const [layoutOpen, setLayoutOpen] = React.useState(false)
  const { data: profile, isLoading } = useProfile()

  const displayName = profile?.name || 'User'
  const displayEmail = profile?.email || ''

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full' disabled={isLoading}>
            {isLoading ? (
              <AvatarSkeleton size={32} square={false} />
            ) : profile ? (
              <Avatar
                src={profile.avatarUrl}
                name={displayName}
                size={32}
                square={false}
              />
            ) : (
              <Avatar
                src={null}
                name='User'
                size={32}
                square={false}
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{displayName}</p>
              {displayEmail && (
                <p className='text-xs leading-none text-muted-foreground'>
                  {displayEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href='/settings'>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings/account'>Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLayoutOpen(true)}>
              Layout
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfigDrawer open={layoutOpen} onOpenChange={setLayoutOpen} />
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
