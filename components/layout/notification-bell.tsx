'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/common/avatar'
import { Button } from '@/components/common/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs'
import { cn } from '@/lib/utils'
import { getAppNotificationHref } from '@/lib/app-notification-href'
import {
  useAppNotifications,
  useMarkAppNotificationRead,
} from '@/hooks/use-app-notifications'
import {
  useAcceptInvitationInbox,
  useInvitationInbox,
} from '@/hooks/use-invitation-inbox'
import type { AppNotificationItem } from '@/services/client/notifications/app-notification-service'
import type { InvitationInboxItem } from '@/services/client/invitations/invitation-inbox-service'

function formatBadgeCount(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

type BellTab = 'notifications' | 'invitations'

function isBellTab(value: string): value is BellTab {
  return value === 'notifications' || value === 'invitations'
}

function bellTabForCounts(
  unreadCount: number,
  inviteCount: number
): BellTab {
  const hasUnread = unreadCount > 0
  const hasInvites = inviteCount > 0
  if (hasInvites && !hasUnread) return 'invitations'
  if (hasUnread && !hasInvites) return 'notifications'
  if (hasInvites && hasUnread) return 'invitations'
  return 'notifications'
}

function invitationInboxSentence(item: InvitationInboxItem) {
  const organizationName = item.organization.name
  const role = item.role?.trim()
  const inviter = item.invitedByName?.trim() || 'A teammate'
  return (
    <>
      <strong className='font-semibold'>{inviter}</strong> invited you to join{' '}
      <strong className='font-semibold'>{organizationName}</strong>
      {role ? (
        <>
          {' '}
          as <strong className='font-semibold'>{role}</strong>
        </>
      ) : null}
      .
    </>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notificationsQuery = useAppNotifications()
  const inboxQuery = useInvitationInbox()

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0
  const inviteCount = inboxQuery.data?.count ?? 0
  const badgeCount = unreadCount + inviteCount

  const [tab, setTab] = useState<BellTab>('notifications')
  const didSelectOnOpen = useRef(false)
  const inboxReady = !inboxQuery.isPending
  const notificationsReady =
    !notificationsQuery.isEnabled || !notificationsQuery.isPending

  useEffect(() => {
    if (!open) {
      didSelectOnOpen.current = false
      return
    }
    if (!inboxReady || !notificationsReady || didSelectOnOpen.current) return
    didSelectOnOpen.current = true
    setTab(bellTabForCounts(unreadCount, inviteCount))
  }, [open, inboxReady, notificationsReady, unreadCount, inviteCount])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative scale-95 rounded-full'
          aria-label={
            badgeCount > 0
              ? `Notifications, ${badgeCount} unread`
              : 'Notifications'
          }
        >
          <Bell className='size-[1.2rem]' />
          {badgeCount > 0 ? (
            <span className='absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-medium text-white'>
              {formatBadgeCount(badgeCount)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-96 gap-0 p-0'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (isBellTab(value)) setTab(value)
          }}
          className='gap-0'
        >
          <TabsList className='w-full px-3'>
            <TabsTrigger value='notifications' className='px-2'>
              Notifications
              {unreadCount > 0 ? (
                <span className='text-xs text-muted-foreground'>
                  ({unreadCount})
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value='invitations' className='px-2'>
              Invitations
              {inviteCount > 0 ? (
                <span className='text-xs text-muted-foreground'>
                  ({inviteCount})
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='notifications' className='max-h-96 overflow-y-auto'>
            <NotificationsTab
              isLoading={notificationsQuery.isLoading}
              canView={notificationsQuery.data?.canView ?? false}
              items={notificationsQuery.data?.notifications ?? []}
              onOpen={() => setOpen(false)}
            />
          </TabsContent>
          <TabsContent value='invitations' className='max-h-96 overflow-y-auto'>
            <InvitationsTab
              isLoading={inboxQuery.isLoading}
              items={inboxQuery.data?.invitations ?? []}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

function NotificationsTab({
  isLoading,
  canView,
  items,
  onOpen,
}: {
  isLoading: boolean
  canView: boolean
  items: AppNotificationItem[]
  onOpen: () => void
}) {
  const router = useRouter()
  const markRead = useMarkAppNotificationRead()

  if (isLoading) {
    return <PanelLoading />
  }

  if (!canView) {
    return (
      <EmptyCopy>
        Billing alerts for this organization appear here when you have access
        to Plan &amp; Billing.
      </EmptyCopy>
    )
  }

  if (items.length === 0) {
    return <EmptyCopy>No notifications yet.</EmptyCopy>
  }

  return (
    <ul className='divide-y'>
      {items.map((item) => {
        const unread = !item.readAt
        return (
          <li key={item.id}>
            <button
              type='button'
              className={cn(
                'flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-accent/60',
                unread && 'bg-accent/30'
              )}
              onClick={() => {
                if (unread) {
                  markRead.mutate(item.id)
                }
                router.push(getAppNotificationHref(item.type))
                onOpen()
              }}
            >
              <div className='flex items-start justify-between gap-2'>
                <p className='text-sm font-medium'>{item.title}</p>
                {unread ? (
                  <span className='mt-1 size-2 shrink-0 rounded-full bg-primary' />
                ) : null}
              </div>
              {item.body ? (
                <p className='text-xs text-muted-foreground'>{item.body}</p>
              ) : null}
              <p className='text-[11px] text-muted-foreground'>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function InvitationsTab({
  isLoading,
  items,
}: {
  isLoading: boolean
  items: InvitationInboxItem[]
}) {
  const accept = useAcceptInvitationInbox()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  if (isLoading) {
    return <PanelLoading />
  }

  if (items.length === 0) {
    return <EmptyCopy>No pending invitations.</EmptyCopy>
  }

  return (
    <ul className='divide-y'>
      {items.map((item) => {
        const isAccepting = acceptingId === item.id && accept.isPending
        return (
          <li key={item.id} className='flex gap-3 px-4 py-3'>
            <Avatar
              src={item.organization.logoUrl}
              name={item.organization.name}
              size={32}
              square
              className='mt-0.5'
            />
            <div className='min-w-0 flex-1 space-y-2'>
              <div>
                <p className='text-sm font-normal'>
                  {invitationInboxSentence(item)}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Expires{' '}
                  {formatDistanceToNow(new Date(item.expiresAt), {
                    addSuffix: true,
                  })}
                </p>
                {item.message ? (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {item.message}
                  </p>
                ) : null}
              </div>
              <Button
                size='sm'
                disabled={isAccepting}
                onClick={async () => {
                  setAcceptingId(item.id)
                  try {
                    const data = await accept.mutateAsync(item.token)
                    toast.success(`Joined ${data.organization.name}`)
                  } catch {
                    // api interceptor already toasts the error
                  } finally {
                    setAcceptingId(null)
                  }
                }}
              >
                {isAccepting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : null}
                Accept
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PanelLoading() {
  return (
    <div className='flex items-center justify-center py-10 text-muted-foreground'>
      <Loader2 className='h-5 w-5 animate-spin' />
    </div>
  )
}

function EmptyCopy({ children }: { children: React.ReactNode }) {
  return (
    <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
      {children}
    </p>
  )
}
