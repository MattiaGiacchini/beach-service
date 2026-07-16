import { describe, it, expect } from 'vitest'
import { deleteVoucherFromReport, replaceVoucherInReport } from '../reportArrayUtils'

const makeRow = (id: string, extra?: Record<string, unknown>) => ({ id, ...extra })

describe('deleteVoucherFromReport', () => {
  it('removes the row with the matching id', () => {
    const report = [makeRow('a'), makeRow('b'), makeRow('c')]
    const result = deleteVoucherFromReport(report, 'b')
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.id === 'b')).toBeUndefined()
  })

  it('keeps all other rows intact', () => {
    const report = [makeRow('a', { value: 1 }), makeRow('b', { value: 2 }), makeRow('c', { value: 3 })]
    const result = deleteVoucherFromReport(report, 'b')
    expect(result).toEqual([makeRow('a', { value: 1 }), makeRow('c', { value: 3 })])
  })

  it('does not mutate the original array', () => {
    const report = [makeRow('a'), makeRow('b')]
    const original = [...report]
    deleteVoucherFromReport(report, 'a')
    expect(report).toEqual(original)
  })

  it('returns an empty array when the only element is deleted', () => {
    const report = [makeRow('only')]
    expect(deleteVoucherFromReport(report, 'only')).toEqual([])
  })

  it('returns the same contents when the id is not found', () => {
    const report = [makeRow('a'), makeRow('b')]
    const result = deleteVoucherFromReport(report, 'z')
    expect(result).toEqual(report)
  })
})

describe('replaceVoucherInReport', () => {
  it('replaces the row with the matching oldId', () => {
    const newVoucher = makeRow('x', { name: 'new' })
    const report = [makeRow('a'), makeRow('b'), makeRow('c')]
    const result = replaceVoucherInReport(report, 'b', newVoucher)
    expect(result[1]).toEqual(newVoucher)
  })

  it('preserves the original array length', () => {
    const report = [makeRow('a'), makeRow('b'), makeRow('c')]
    const result = replaceVoucherInReport(report, 'b', makeRow('x'))
    expect(result).toHaveLength(report.length)
  })

  it('does not contain the old row after replacement', () => {
    const report = [makeRow('a'), makeRow('b')]
    const result = replaceVoucherInReport(report, 'b', makeRow('x'))
    expect(result.find((r) => r.id === 'b')).toBeUndefined()
  })

  it('leaves all other rows unchanged', () => {
    const rowA = makeRow('a', { v: 1 })
    const rowC = makeRow('c', { v: 3 })
    const report = [rowA, makeRow('b'), rowC]
    const result = replaceVoucherInReport(report, 'b', makeRow('x'))
    expect(result[0]).toEqual(rowA)
    expect(result[2]).toEqual(rowC)
  })

  it('does not mutate the original array', () => {
    const report = [makeRow('a'), makeRow('b')]
    const original = [...report]
    replaceVoucherInReport(report, 'a', makeRow('x'))
    expect(report).toEqual(original)
  })

  it('returns the same contents when oldId is not found', () => {
    const report = [makeRow('a'), makeRow('b')]
    const result = replaceVoucherInReport(report, 'z', makeRow('x'))
    expect(result).toEqual(report)
  })
})
