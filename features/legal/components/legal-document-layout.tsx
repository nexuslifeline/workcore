import Image from 'next/image'
import Link from 'next/link'

type LegalDocument = 'terms' | 'privacy'

type LegalDocumentLayoutProps = {
  current: LegalDocument
  children: React.ReactNode
}

const documents: { id: LegalDocument; href: string; label: string }[] = [
  { id: 'terms', href: '/terms', label: 'Terms of Service' },
  { id: 'privacy', href: '/privacy', label: 'Privacy Policy' },
]

function DocumentLinks({ current }: { current: LegalDocument }) {
  return (
    <nav className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
      {documents.map((document, index) => (
        <span key={document.id} className='flex items-center gap-3'>
          {index > 0 && <span aria-hidden>•</span>}
          {document.id === current ? (
            <span className='font-medium text-foreground'>{document.label}</span>
          ) : (
            <Link
              href={document.href}
              className='underline underline-offset-4 hover:text-primary'
            >
              {document.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export function LegalDocumentLayout({
  current,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <div className='min-h-svh bg-background'>
      <header className='border-b'>
        <div className='mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <Link href='/sign-in' className='shrink-0'>
            <Image
              src='/logo/seed-logo.png'
              alt='Workcore'
              width={160}
              height={36}
              className='h-8 w-auto'
              priority
            />
          </Link>
          <Link
            href='/sign-in'
            className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
          >
            Back to sign-in
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-4 py-10 sm:px-6'>
        <article>{children}</article>
      </main>

      <footer className='border-t'>
        <div className='mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <DocumentLinks current={current} />
          <Link
            href='/sign-in'
            className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
          >
            Back to sign-in
          </Link>
        </div>
      </footer>
    </div>
  )
}
