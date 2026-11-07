'use client'

import type { ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { Skeleton } from '@/components/common/skeletons/skeleton'
import { tabsNeedAttentionMessage } from '@/components/common/form-tab-errors'
import { WorkspaceRouteTabs } from '@/components/common/workspace-route-tabs'

export type FormSection = {
  value: string
  label: string
  icon: ReactNode
}

type FormSectionNavProps = {
  sections: FormSection[]
  value: string
  onValueChange: (value: string) => void
  invalidValues?: string[]
}

function InvalidMark() {
  return <span className='size-1.5 shrink-0 rounded-full bg-destructive' aria-hidden='true' />
}

export function FormSectionNav({
  sections,
  value,
  onValueChange,
  invalidValues = [],
}: FormSectionNavProps) {
  const invalid = new Set(invalidValues)
  const attention = tabsNeedAttentionMessage(
    sections.filter((section) => invalid.has(section.value)).map((section) => section.label)
  )

  return (
    <div className='shrink-0'>
      <div className='border-b px-6 py-3 md:hidden'>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className='h-12 w-full' aria-label='Select section'>
            <SelectValue placeholder='Select section' />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.value} value={section.value}>
                <span className='flex items-center gap-2'>
                  {invalid.has(section.value) ? <InvalidMark /> : null}
                  <span className='[&_svg]:size-4'>{section.icon}</span>
                  {section.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='hidden md:block'>
        <WorkspaceRouteTabs
          tabs={sections.map((section) => ({
            ...section,
            invalid: invalid.has(section.value),
          }))}
          activeValue={value}
          size='sm'
        />
      </div>

      {attention ? (
        <p
          className='mx-6 mt-4 -mb-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'
          role='alert'
        >
          {attention}
        </p>
      ) : null}
    </div>
  )
}

type FormSectionNavSkeletonProps = {
  tabCount?: number
}

export function FormSectionNavSkeleton({
  tabCount = 5,
}: FormSectionNavSkeletonProps) {
  return (
    <div className='shrink-0'>
      <div className='border-b px-6 py-3 md:hidden'>
        <Skeleton className='h-12 w-full' />
      </div>
      <div className='hidden w-full min-w-0 gap-0 overflow-hidden border-b md:flex'>
        {Array.from({ length: tabCount }).map((_, index) => (
          <Skeleton key={index} className='mx-2 my-3 h-5 min-w-0 flex-1' />
        ))}
      </div>
    </div>
  )
}
