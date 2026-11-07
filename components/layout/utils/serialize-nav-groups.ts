import type {
  NavCollapsible,
  NavGroup,
  NavItem,
  NavLink,
  SerializableNavGroup,
  SerializableNavItem,
} from '../types'
import { sidebarNavIconKeyFromComponent } from '../data/sidebar-nav-icon-map'

function serializeItem(item: NavItem): SerializableNavItem {
  if ('items' in item && item.items) {
    const { icon, items, ...rest } = item as NavCollapsible
    return {
      ...rest,
      iconKey: sidebarNavIconKeyFromComponent(icon),
      items: items.map((child) => serializeItem(child as NavItem)),
    }
  }

  const { icon, ...rest } = item as NavLink
  return {
    ...rest,
    iconKey: sidebarNavIconKeyFromComponent(icon),
  }
}

/** Strip non-serializable `icon` components for passing from RSC → client. */
export function serializeNavGroups(navGroups: NavGroup[]): SerializableNavGroup[] {
  return navGroups.map((group) => ({
    title: group.title,
    items: group.items.map(serializeItem),
  }))
}
