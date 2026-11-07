import { ContentSection } from '../../components/content-section'
import { SidebarConfig } from '../components/sidebar-config'

export function SettingsAppearanceSidebar() {
  return (
    <ContentSection
      title='Sidebar'
      desc='Choose between inset, floating, or standard sidebar layout.'
    >
      <SidebarConfig />
    </ContentSection>
  )
}
