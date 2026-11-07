'use client'

import type {
  NavCollapsible,
  NavGroup,
  NavItem,
  NavLink,
  SerializableNavGroup,
  SerializableNavItem,
} from './types'
import { NavGroup as NavGroupView } from './nav-group'
import { sidebarNavIconFromKey } from './data/sidebar-nav-icon-map'

function hydrateItem(item: SerializableNavItem): NavItem {
  if ('items' in item && item.items) {
    const { iconKey, items, ...rest } = item
    return {
      ...rest,
      icon: sidebarNavIconFromKey(iconKey),
      items: items.map(hydrateItem),
    } as NavCollapsible
  }

  const { iconKey, ...rest } = item
  return {
    ...rest,
    icon: sidebarNavIconFromKey(iconKey),
  } as NavLink
}

function hydrateGroups(groups: SerializableNavGroup[]): NavGroup[] {
  return groups.map((g) => ({
    title: g.title,
    items: g.items.map(hydrateItem),
  }))
}

type SidebarNavGroupsViewProps = {
  groups: SerializableNavGroup[]
}

/** Restores Lucide icons from `iconKey` and renders interactive `NavGroup` views. */
export function SidebarNavGroupsView({ groups }: SidebarNavGroupsViewProps) {
  const navGroups = hydrateGroups(groups)
  return (
    <>
      {navGroups.map((props) => (
        <NavGroupView key={props.title} {...props} />
      ))}
    </>
  )
}
