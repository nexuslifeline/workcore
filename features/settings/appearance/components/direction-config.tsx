'use client'

import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { IconDir } from '@/assets/custom/icon-dir'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'
import { Button } from '@/components/common/button'

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

export function DirectionConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  return (
    <div>
      <SectionTitle
        title='Direction'
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className='grid w-full max-w-md grid-cols-2 gap-4'
        aria-label='Select site direction'
        aria-describedby='direction-description'
      >
        {[
          {
            value: 'ltr',
            label: 'Left to Right',
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='ltr' {...props} />
            ),
          },
          {
            value: 'rtl',
            label: 'Right to Left',
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='rtl' {...props} />
            ),
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='direction-description' className='sr-only'>
        Choose between left-to-right or right-to-left site direction
      </div>
    </div>
  )
}
