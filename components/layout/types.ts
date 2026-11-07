type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  code?: string
  /** Show if the user has any of these permission codes (OR). */
  anyOfCodes?: string[]
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: string
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url?: string; items?: (BaseNavItem & { url: string })[] })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

/** Serializable nav for server → client (no React components). */
type SerializableNavLink = {
  code?: string
  anyOfCodes?: string[]
  title: string
  badge?: string
  iconKey?: string
  url: string
}

type SerializableNavCollapsible = {
  code?: string
  anyOfCodes?: string[]
  title: string
  badge?: string
  iconKey?: string
  items: SerializableNavItem[]
}

type SerializableNavItem = SerializableNavCollapsible | SerializableNavLink

type SerializableNavGroup = {
  title: string
  items: SerializableNavItem[]
}

export type {
  SidebarData,
  NavGroup,
  NavItem,
  NavCollapsible,
  NavLink,
  SerializableNavGroup,
  SerializableNavItem,
  SerializableNavLink,
  SerializableNavCollapsible,
}
