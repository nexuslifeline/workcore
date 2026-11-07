'use client'

import Link from 'next/link'

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  User,
} from 'lucide-react'

import useDialogState from '@/hooks/use-dialog-state'
import { Avatar } from '@/components/common/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/common/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useProfile } from '@/hooks/use-profile'
import { UserProfileSkeleton } from '@/components/common/skeletons'

export function NavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const { data: profile, isLoading } = useProfile()

  const displayName = profile?.name || 'User'
  const displayEmail = profile?.email || ''

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='pointer-events-none'>
            <UserProfileSkeleton avatarSize={32} avatarSquare />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                {profile && (
                  <Avatar
                    src={profile.avatarUrl}
                    name={displayName}
                    size={32}
                    square
                  />
                )}
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{displayName}</span>
                  {displayEmail && (
                    <span className='truncate text-xs'>{displayEmail}</span>
                  )}
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  {profile && (
                    <Avatar
                      src={profile.avatarUrl}
                      name={displayName}
                      size={32}
                      square
                    />
                  )}
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{displayName}</span>
                    {displayEmail && (
                      <span className='truncate text-xs'>{displayEmail}</span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href='/settings'>
                    <User />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/settings/account'>
                    <BadgeCheck />
                    Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
