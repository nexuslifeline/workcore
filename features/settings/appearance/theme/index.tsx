import { ContentSection } from '../../components/content-section'
import { ThemeConfig } from '../components/theme-config'

export function SettingsAppearanceTheme() {
  return (
    <ContentSection
      title='Theme'
      desc='Choose between system preference, light mode, or dark mode.'
    >
      <ThemeConfig />
    </ContentSection>
  )
}
