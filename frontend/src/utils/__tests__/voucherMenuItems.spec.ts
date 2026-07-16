import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import { buildMenuItemLabels, buildMenuItems } from '../voucherMenuItems'
import type { Voucher } from '@/types/Voucher'

// Arbitrary for a full Voucher object
const voucherArb = fc.record<Voucher>({
  id: fc.string({ minLength: 1 }),
  bsNumber: fc.integer({ min: 1 }),
  customerName: fc.string({ minLength: 1 }),
  checkIn: fc.constant('2024-06-01'),
  checkOut: fc.constant('2024-06-07'),
  beds: fc.integer({ min: 0 }),
  umbrellas: fc.integer({ min: 0 }),
  roomNumber: fc.integer({ min: 0 }),
  friendly: fc.boolean(),
  voucherStatus: fc.constantFrom('active', 'cancelled'),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

describe('buildMenuItemLabels', () => {
  it('returns empty array for null voucher', () => {
    expect(buildMenuItemLabels(null)).toEqual([])
  })

  it('returns ["Edit","Delete"] for a friendly voucher', () => {
    const voucher = { friendly: true } as Voucher
    expect(buildMenuItemLabels(voucher)).toEqual(['Edit', 'Delete'])
  })

  it('returns ["Edit","Convert to A","Delete"] for a non-friendly voucher', () => {
    const voucher = { friendly: false } as Voucher
    expect(buildMenuItemLabels(voucher)).toEqual(['Edit', 'Convert to A', 'Delete'])
  })

  // Property 1: Context menu items reflect voucher type
  // Validates: Requirements 1.1, 1.4
  it('Property 1: labels always include Delete and Edit; Convert to A iff friendly=false', () => {
    fc.assert(
      fc.property(voucherArb, (voucher) => {
        const labels = buildMenuItemLabels(voucher)

        // Always contains Delete and Edit
        expect(labels).toContain('Delete')
        expect(labels).toContain('Edit')

        if (!voucher.friendly) {
          // BS vouchers include Convert to A
          expect(labels).toContain('Convert to A')
          expect(labels).toHaveLength(3)
        } else {
          // Friendly (A) vouchers do NOT include Convert to A
          expect(labels).not.toContain('Convert to A')
          expect(labels).toHaveLength(2)
        }
      }),
      { numRuns: 100 }
    )
  })
})

describe('buildMenuItems', () => {
  const makeCallbacks = () => ({
    openDelete: vi.fn(),
    openEdit: vi.fn(),
    openConvert: vi.fn(),
  })

  it('returns empty array for null voucher', () => {
    expect(buildMenuItems(null, makeCallbacks())).toEqual([])
  })

  it('each item has label, icon, and command', () => {
    const voucher = { friendly: false } as Voucher
    const callbacks = makeCallbacks()
    const items = buildMenuItems(voucher, callbacks)

    expect(items).toHaveLength(3)
    items.forEach((item) => {
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('icon')
      expect(item).toHaveProperty('command')
      expect(typeof item.command).toBe('function')
    })
  })

  it('Delete item uses pi-trash icon and calls openDelete', () => {
    const voucher = { friendly: true } as Voucher
    const callbacks = makeCallbacks()
    const items = buildMenuItems(voucher, callbacks)
    const deleteItem = items.find((i) => i.label === 'Delete')!

    expect(deleteItem.icon).toBe('pi pi-trash')
    deleteItem.command()
    expect(callbacks.openDelete).toHaveBeenCalledOnce()
  })

  it('Edit item uses pi-pencil icon and calls openEdit', () => {
    const voucher = { friendly: true } as Voucher
    const callbacks = makeCallbacks()
    const items = buildMenuItems(voucher, callbacks)
    const editItem = items.find((i) => i.label === 'Edit')!

    expect(editItem.icon).toBe('pi pi-pencil')
    editItem.command()
    expect(callbacks.openEdit).toHaveBeenCalledOnce()
  })

  it('Convert to A item uses pi-star icon and calls openConvert', () => {
    const voucher = { friendly: false } as Voucher
    const callbacks = makeCallbacks()
    const items = buildMenuItems(voucher, callbacks)
    const convertItem = items.find((i) => i.label === 'Convert to A')!

    expect(convertItem.icon).toBe('pi pi-star')
    convertItem.command()
    expect(callbacks.openConvert).toHaveBeenCalledOnce()
  })
})
