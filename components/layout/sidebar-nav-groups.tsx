import { getSessionPermissions } from '@/lib/server/get-session-permissions'
import { sidebarData } from './data/sidebar-data'
import { filterNavGroupsByAllowedCodes } from './data/sidebar-filter'
import { serializeNavGroups } from './utils/serialize-nav-groups'
import { SidebarNavGroupsView } from './sidebar-nav-groups-view'

/**
 * Server Component: loads allowed permission codes, filters nav, serializes icons to keys,
 * then hands off to the client for hydration + interactive sidebar UI.
 */
export async function SidebarNavGroups() {
  const allowedCodes = await getSessionPermissions()
  const filtered = filterNavGroupsByAllowedCodes(
    sidebarData.navGroups,
    allowedCodes
  )
  const serializable = serializeNavGroups(filtered)
  return <SidebarNavGroupsView groups={serializable} />
}
