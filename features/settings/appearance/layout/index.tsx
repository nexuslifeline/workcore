import { ContentSection } from '../../components/content-section'
import { LayoutConfig } from '../components/layout-config'

export function SettingsAppearanceLayout() {
  return (
    <ContentSection
      title='Layout'
      desc='Choose between default expanded, compact icon-only, or full layout mode.'
    >
      <LayoutConfig />
    </ContentSection>
  )
}
