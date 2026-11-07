import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Info, LogIn } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/common/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'
import { Avatar } from '@/components/common/avatar'
import { Badge } from '@/components/common/badges/badge'
import { Button } from '@/components/common/button'
import { AuthLayout } from '@/features/auth/auth-layout'
import { inviteSignInPath } from '@/features/invitations/lib/invite-paths'
import { AcceptInvitationButton } from './accept-invitation-button'
import { InviteSignUpPanel } from './invite-sign-up-panel'
import { InviteSignOutButton } from './invite-sign-out-button'

export type InvitationData = {
  email: string
  role: string | null
  message: string | null
  expiresAt: string
  invitedByName: string | null
  organization: {
    id: string
    name: string
    description?: string | null
    logoUrl?: string | null
  }
}

export type InvitationView =
  | { kind: 'invalid' }
  | { kind: 'expired'; organizationName?: string }
  | { kind: 'used'; organizationName?: string; isAuthenticated: boolean }
  | { kind: 'revoked'; organizationName?: string }
  | {
      kind: 'wrong_account'
      token: string
      signedInEmail: string
      invitation: InvitationData
    }
  | {
      kind: 'ready'
      token: string
      isAuthenticated: boolean
      hasAccount: boolean
      signedInEmail: string | null
      invitation: InvitationData
    }

const DEAD_COPY = {
  invalid: {
    title: 'Invitation not found',
    body: 'This invite was not found. Ask the person who invited you for a new link.',
  },
  expired: {
    title: 'Invitation expired',
    body: 'This invite expired. Ask the person who invited you to send it again.',
  },
  revoked: {
    title: 'Invitation no longer valid',
    body: 'This invite is no longer valid. Ask the person who invited you for a new link.',
  },
} as const

function InvitationHero({ invitation }: { invitation: InvitationData }) {
  const organizationName = invitation.organization.name
  const inviter = invitation.invitedByName?.trim() || 'A teammate'
  const role = invitation.role?.trim() || null
  const expiresAt = new Date(invitation.expiresAt)

  return (
    <CardHeader className='items-center justify-items-center text-center'>
      <Avatar
        src={invitation.organization.logoUrl}
        name={organizationName}
        size={56}
        square
      />
      <CardTitle className='text-xl tracking-tight'>
        {organizationName}
      </CardTitle>
      <CardDescription className='text-sm text-pretty'>
        <strong className='font-semibold text-foreground'>{inviter}</strong>{' '}
        invited you to join
        {role ? ' as' : '.'}
      </CardDescription>
      {role ? (
        <Badge variant='secondary' shape='pill'>
          {role}
        </Badge>
      ) : null}
      <p className='text-xs text-muted-foreground'>
        Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
      </p>
    </CardHeader>
  )
}

function InvitationMessage({ message }: { message: string | null }) {
  const text = message?.trim()
  if (!text) return null
  return (
    <blockquote className='border-l-2 pl-3 text-sm text-muted-foreground'>
      {text}
    </blockquote>
  )
}

function ReadyAction({
  invitation,
  token,
  isAuthenticated,
  hasAccount,
  signedInEmail,
}: Extract<InvitationView, { kind: 'ready' }>) {
  const organizationName = invitation.organization.name

  if (isAuthenticated) {
    return (
      <div className='space-y-3'>
        {signedInEmail ? (
          <p className='text-center text-sm text-muted-foreground'>
            Signed in as {signedInEmail}
          </p>
        ) : null}
        <AcceptInvitationButton
          token={token}
          organizationName={organizationName}
        />
      </div>
    )
  }

  if (hasAccount) {
    return (
      <Button asChild className='w-full'>
        <Link href={inviteSignInPath(token, invitation.email)}>
          <LogIn className='h-4 w-4' />
          Sign in to join {organizationName}
        </Link>
      </Button>
    )
  }

  return (
    <InviteSignUpPanel
      email={invitation.email}
      token={token}
      organizationName={organizationName}
    />
  )
}

function UsedInvitation({
  organizationName,
  isAuthenticated,
}: {
  organizationName?: string
  isAuthenticated: boolean
}) {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardContent className='space-y-4'>
          <Alert>
            <Info />
            <AlertTitle>Invitation already used</AlertTitle>
            <AlertDescription className='text-pretty'>
              {organizationName ? (
                <>
                  This invite to join{' '}
                  <strong className='font-semibold text-foreground'>
                    {organizationName}
                  </strong>{' '}
                  was already accepted.
                </>
              ) : (
                <>This invite was already accepted.</>
              )}{' '}
              If that was you, sign in to open it. If it was not, ask the
              person who invited you for a new link.
            </AlertDescription>
          </Alert>
          {isAuthenticated ? (
            <Button asChild className='w-full'>
              <Link href='/'>Go to Workcore</Link>
            </Button>
          ) : (
            <Button asChild className='w-full'>
              <Link href='/sign-in'>
                <LogIn className='h-4 w-4' />
                Sign in
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

function DeadInvitation({
  kind,
  organizationName,
}: {
  kind: keyof typeof DEAD_COPY
  organizationName?: string
}) {
  const copy = DEAD_COPY[kind]
  const named =
    organizationName && kind === 'expired'
      ? `This invite to join ${organizationName} expired. Ask the person who invited you to send it again.`
      : organizationName && kind === 'revoked'
        ? `This invite to join ${organizationName} is no longer valid. Ask the person who invited you for a new link.`
        : copy.body

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl tracking-tight'>{copy.title}</CardTitle>
          <CardDescription className='text-pretty'>{named}</CardDescription>
        </CardHeader>
      </Card>
    </AuthLayout>
  )
}

export function Invitation({ view }: { view: InvitationView }) {
  if (view.kind === 'used') {
    return (
      <UsedInvitation
        organizationName={view.organizationName}
        isAuthenticated={view.isAuthenticated}
      />
    )
  }

  if (
    view.kind === 'invalid' ||
    view.kind === 'expired' ||
    view.kind === 'revoked'
  ) {
    return (
      <DeadInvitation
        kind={view.kind}
        organizationName={
          view.kind === 'invalid' ? undefined : view.organizationName
        }
      />
    )
  }

  const { invitation } = view

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <InvitationHero invitation={invitation} />
        <CardContent className='space-y-4'>
          <InvitationMessage message={invitation.message} />
          {view.kind === 'wrong_account' ? (
            <div className='space-y-3'>
              <Alert className='border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'>
                <AlertTriangle />
                <AlertTitle>Wrong account</AlertTitle>
                <AlertDescription className='text-pretty text-amber-900/80 dark:text-amber-100/80'>
                  This invite is for{' '}
                  <strong className='font-semibold text-amber-950 dark:text-amber-100'>
                    {invitation.email}
                  </strong>
                  . You are signed in as{' '}
                  <strong className='font-semibold text-amber-950 dark:text-amber-100'>
                    {view.signedInEmail}
                  </strong>
                  .
                </AlertDescription>
              </Alert>
              <InviteSignOutButton token={view.token} />
            </div>
          ) : (
            <ReadyAction {...view} />
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
