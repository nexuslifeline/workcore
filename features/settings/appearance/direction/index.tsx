import { ContentSection } from '../../components/content-section'
import { DirectionConfig } from '../components/direction-config'

export function SettingsAppearanceDirection() {
  return (
    <ContentSection
      title='Direction'
      desc='Choose between left-to-right or right-to-left site direction.'
    >
      <DirectionConfig />
    </ContentSection>
  )
}
