import type { ElementType } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  AudioWaveform,
  Book,
  BookOpen,
  Building2,
  ClipboardList,
  Command,
  CreditCard,
  FileCheck,
  FileText,
  GalleryVerticalEnd,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  List,
  Package,
  Palette,
  Percent,
  Receipt,
  RefreshCw,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  UserCircle,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Icons used by sidebar nav (reference equality used when serializing for RSC).
 */
export const SIDEBAR_NAV_ICON_ENTRIES = [
  ['LayoutDashboard', LayoutDashboard],
  ['TrendingUp', TrendingUp],
  ['FileCheck', FileCheck],
  ['ShoppingBag', ShoppingBag],
  ['FileText', FileText],
  ['CreditCard', CreditCard],
  ['ShoppingCart', ShoppingCart],
  ['ClipboardList', ClipboardList],
  ['Receipt', Receipt],
  ['BookOpen', BookOpen],
  ['Book', Book],
  ['RefreshCw', RefreshCw],
  ['UserCircle', UserCircle],
  ['Truck', Truck],
  ['Package', Package],
  ['Users', Users],
  ['Shield', Shield],
  ['Building2', Building2],
  ['Settings', Settings],
  ['Palette', Palette],
  ['Wrench', Wrench],
  ['HelpCircle', HelpCircle],
  ['FolderKanban', FolderKanban],
  ['Command', Command],
  ['GalleryVerticalEnd', GalleryVerticalEnd],
  ['AudioWaveform', AudioWaveform],
  ['List', List],
  ['Tags', Tags],
  ['Percent', Percent],
  ['ArrowDownCircle', ArrowDownCircle],
  ['ArrowUpCircle', ArrowUpCircle],
  ['CalendarDays', CalendarDays],
] as const satisfies readonly (readonly [string, LucideIcon])[]

export type SidebarNavIconKey = (typeof SIDEBAR_NAV_ICON_ENTRIES)[number][0]

export const SIDEBAR_NAV_ICON_MAP = Object.fromEntries(
  SIDEBAR_NAV_ICON_ENTRIES
) as Record<string, LucideIcon>

/**
 * Resolve registry key by reference. Nav items type `icon` as `ElementType` (any component);
 * we only match known Lucide icons from the sidebar map.
 */
export function sidebarNavIconKeyFromComponent(
  Icon: ElementType | undefined
): string | undefined {
  if (!Icon || typeof Icon === 'string') return undefined
  for (const [key, C] of SIDEBAR_NAV_ICON_ENTRIES) {
    if (C === Icon) return key
  }
  return undefined
}

export function sidebarNavIconFromKey(
  key: string | undefined
): LucideIcon | undefined {
  if (!key) return undefined
  return SIDEBAR_NAV_ICON_MAP[key]
}
