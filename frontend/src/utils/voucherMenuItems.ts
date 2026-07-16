import type { Voucher } from '@/types/Voucher'

export interface MenuItemCallbacks {
  openDelete: () => void
  openEdit: () => void
  openConvert: () => void
}

export interface MenuItem {
  label: string
  icon: string
  command: () => void
}

/**
 * Returns the list of menu item labels for a given voucher.
 * - friendly=true  → ["Edit", "Delete"]
 * - friendly=false → ["Edit", "Convert to A", "Delete"]
 * - null voucher   → []
 */
export function buildMenuItemLabels(voucher: Voucher | null): string[] {
  if (!voucher) return []
  const labels = ['Edit']
  if (!voucher.friendly) {
    labels.push('Convert to A')
  }
  labels.push('Delete')
  return labels
}

/**
 * Maps labels to PrimeVue menu item objects with label, icon, and command.
 */
export function buildMenuItems(
  voucher: Voucher | null,
  callbacks: MenuItemCallbacks
): MenuItem[] {
  if (!voucher) return []

  const labels = buildMenuItemLabels(voucher)

  const iconMap: Record<string, string> = {
    Delete: 'pi pi-trash',
    Edit: 'pi pi-pencil',
    'Convert to A': 'pi pi-star',
  }

  const commandMap: Record<string, () => void> = {
    Delete: callbacks.openDelete,
    Edit: callbacks.openEdit,
    'Convert to A': callbacks.openConvert,
  }

  return labels.map((label) => ({
    label,
    icon: iconMap[label],
    command: commandMap[label],
  }))
}
