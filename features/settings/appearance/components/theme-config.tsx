'use client'

import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { useFont } from '@/context/font-provider'
import { fonts } from '@/config/fonts'
import { Button } from '@/components/common/button'
import { Combobox } from '@/components/common/combobox'

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

export function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  const { font, setFont, resetFont } = useFont()
  const defaultFont = fonts[0]

  const fontOptions = fonts.map((fontOption) => ({
    label: fontOption.charAt(0).toUpperCase() + fontOption.slice(1),
    value: fontOption,
  }))

  return (
    <div className='space-y-8'>
      {/* Font Selection */}
      <div>
        <SectionTitle
          title='Font'
          showReset={font !== defaultFont}
          onReset={resetFont}
        />
        <Combobox
          options={fontOptions}
          value={font}
          onValueChange={(value) => setFont(value as typeof font)}
          placeholder='Select font'
          searchPlaceholder='Search font...'
          emptyMessage='No font found.'
        />
        <p id='font-description' className='mt-2 text-sm text-muted-foreground'>
          Set the font you want to use throughout the application.
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <SectionTitle
          title='Theme'
          showReset={theme !== defaultTheme}
          onReset={() => setTheme(defaultTheme)}
        />
        <Radio
          value={theme}
          onValueChange={setTheme}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select theme preference'
          aria-describedby='theme-description'
        >
          {[
            {
              value: 'system',
              label: 'System',
              icon: IconThemeSystem,
            },
            {
              value: 'light',
              label: 'Light',
              icon: IconThemeLight,
            },
            {
              value: 'dark',
              label: 'Dark',
              icon: IconThemeDark,
            },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} isTheme />
          ))}
        </Radio>
        <div id='theme-description' className='sr-only'>
          Choose between system preference, light mode, or dark mode
        </div>
      </div>
    </div>
  )
}
