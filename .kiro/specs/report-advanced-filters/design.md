# Design Document — Report Advanced Filters

## Overview

This feature replaces the primitive filter controls inside `ReportTable.vue`'s card header with a dedicated `ReportFilterBar.vue` component that provides three coordinated filter groups:

1. **Status Filter** — PrimeVue `MultiSelect` with a custom summary label
2. **Date Filter** — a Year dropdown plus optional Min/Max month-day pickers with cross-field validation
3. **Search Bar** — a client-side text input that filters already-fetched rows without any API call

The date filter and status filter drive server-side requests via the existing `fillReport()` path; the search bar is purely in-memory. The `ReportFilterBar` is inserted into `ReportView.vue` above the table, the legacy inline controls inside `ReportTable.vue` are removed, and `ReportView.vue` owns the `searchQuery` state so it can apply the computed filter to the rows before passing them to the table.

---

## Architecture

```
ReportView.vue
├── ReportFilterBar.vue          ← new component (filter controls only)
│   ├── PrimeVue MultiSelect     (status filter)
│   ├── PrimeVue Select          (year selector)
│   ├── Two month-day inputs     (min / max date)
│   └── PrimeVue InputText       (search bar)
└── ReportTable.vue              ← receives :report prop (filtered rows + filtered revenue)
```

### Data-flow diagram

```
User interaction
      │
      ├─ status / year / date change
      │       └──► ReportStore (statusFilter, startDateFilter, endDateFilter)
      │                   └──► fillReport() ──► Supabase RPC ──► store.report[]
      │
      └─ search query change
              └──► ReportView computed: filteredReport
                        ├── filters store.report[] client-side
                        └──► :report prop on ReportTable
                        └──► :totalRevenue prop on ReportTable (filtered sum)
```

### Key design decisions

- **`ReportTable` becomes a pure display component.** It no longer reads `report` or `totalRevenue` directly from the store; instead it receives them as props. This cleanly separates the filtering concern from rendering.
- **`searchQuery` lives in `ReportView`**, not the store, because it controls no API calls and does not need to survive navigation.
- **Date validation is extracted to a pure utility function** (`useDateFilterUtils`) so it can be property-tested in isolation without mounting components.
- **Year state lives in `ReportFilterBar`** as a local ref and is synced into the store's `startDateFilter`/`endDateFilter` on every change — the store never holds a raw `year` field.
- **PrimeVue 4 components are used throughout** (already a dependency: `Select`, `MultiSelect`, `InputText`, `FloatLabel`). No new UI library is introduced.

---

## Components and Interfaces

### `ReportFilterBar.vue`

**Location:** `src/components/report/ReportFilterBar.vue`

**Props:** none (reads/writes the report store directly)

**Emits:** none

**Internal state:**

```typescript
const selectedYear = ref<number>(new Date().getFullYear())
const minMonthDay = ref<{ month: number; day: number } | null>(null)
const maxMonthDay = ref<{ month: number; day: number } | null>(null)
const minError = ref<string | null>(null)
const maxError = ref<string | null>(null)
const rangeError = ref<string | null>(null)
```

**Template structure (Pug):**

```pug
div.filter-bar
  //- Status filter
  MultiSelect(
    v-model="reportStore.statusFilter"
    :options="statusOptions"
    option-label="text"
    option-value="key"
    placeholder="All statuses"
    :max-selected-labels="1"
    selected-items-label="{0} statuses selected"
    @update:model-value="reportStore.fillReport()"
  )

  //- Date filter group
  div.date-filter-group
    Select(
      v-model="selectedYear"
      :options="yearOptions"
      :disabled="reportStore.reportLoading"
      @update:model-value="onYearChange"
    )
    MonthDayInput(
      label="From"
      v-model="minMonthDay"
      :error="minError || rangeError"
      @update:model-value="onMinDateChange"
    )
    MonthDayInput(
      label="To"
      v-model="maxMonthDay"
      :error="maxError || rangeError"
      @update:model-value="onMaxDateChange"
    )

  //- Search bar
  InputText(
    v-model="searchQuery"
    placeholder="Search by name or BS number"
    @update:model-value="$emit('search', $event)"
  )
```

> The `searchQuery` prop/emit pattern keeps the filter bar stateless with respect to the search; the actual `searchQuery` ref lives in `ReportView`.

**Key handlers:**

```typescript
function onYearChange(newYear: number) {
  selectedYear.value = newYear
  reportStore.startDateFilter = minMonthDay.value
    ? buildISODate(newYear, minMonthDay.value.month, minMonthDay.value.day)
    : `${newYear}-01-01`
  reportStore.endDateFilter = maxMonthDay.value
    ? buildISODate(newYear, maxMonthDay.value.month, maxMonthDay.value.day)
    : `${newYear}-12-31`
  reportStore.fillReport()
}

function onMinDateChange(value: { month: number; day: number } | null) {
  if (value === null) {
    minError.value = null
    reportStore.startDateFilter = `${selectedYear.value}-01-01`
  } else {
    const valid = isValidMonthDay(selectedYear.value, value.month, value.day)
    minError.value = valid ? null : `${value.month}/${value.day} does not exist in ${selectedYear.value}`
    if (!valid) return
    reportStore.startDateFilter = buildISODate(selectedYear.value, value.month, value.day)
  }
  rangeError.value = validateRange(minMonthDay.value, maxMonthDay.value)
  if (!rangeError.value) reportStore.fillReport()
}

// onMaxDateChange mirrors onMinDateChange for endDateFilter / maxMonthDay
```

---

### `ReportTable.vue` (changes)

The component is converted from reading `report` / `totalRevenue` from the store to accepting them as **props**:

```typescript
const props = defineProps<{
  report: object[]
  totalRevenue: number
  review?: boolean
}>()
```

The `MultiSelect` status filter and the duplicate refresh `Button` currently inside `#title` are **removed**. The `statusFilter`, `reportLoading`, `totalRevenue` store refs that were imported for rendering purposes are no longer needed in the template (the store may still be imported for the `fillReport` / `$reset` calls that remain, e.g. the refresh button moves to `ReportFilterBar`).

---

### `ReportView.vue` (changes)

```typescript
const reportStore = useReportStore()
const { report } = storeToRefs(reportStore)

const searchQuery = ref<string>('')

// Computed filtered rows — pure client-side, no API call
const filteredReport = computed<object[]>(() => {
  const q = searchQuery.value.trim()
  if (!q) return report.value ?? []
  const lower = q.toLowerCase()
  const numericId = /^\d+$/.test(q) ? parseInt(q, 10) : null
  return (report.value ?? []).filter((row: any) => {
    const nameMatch = row.customerName?.toLowerCase().includes(lower)
    const bsMatch = numericId !== null && row.bsNumber === numericId
    return nameMatch || bsMatch
  })
})

// Computed filtered revenue sum
const filteredRevenue = computed<number>(() =>
  filteredReport.value.reduce((sum: number, row: any) => sum + (row.totalVoucherValue ?? 0), 0)
)

onMounted(() => {
  reportStore.$reset()
  const year = new Date().getFullYear()
  reportStore.startDateFilter = `${year}-01-01`
  reportStore.endDateFilter = `${year}-12-31`
  reportStore.fillReport()
})
```

Template change:

```pug
main.report-layout
  ReportFilterBar(@search="searchQuery = $event")
  ReportTable(:report="filteredReport" :total-revenue="filteredRevenue")
```

---

### `useDateFilterUtils` composable (new)

**Location:** `src/composables/dateFilterUtils.ts`

Extracted pure functions, fully unit- and property-testable:

```typescript
export function useDateFilterUtils() {

  /** Returns the number of days in a given month of a given year. */
  function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate()
  }

  /** Returns true if the month/day combination is valid for the given year. */
  function isValidMonthDay(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12) return false
    if (day < 1) return false
    return day <= daysInMonth(year, month)
  }

  /**
   * Returns null if the range is valid (min <= max or one side is null),
   * or an error message string if minDate ordinal > maxDate ordinal.
   */
  function validateRange(
    min: { month: number; day: number } | null,
    max: { month: number; day: number } | null
  ): string | null {
    if (!min || !max) return null
    const minOrdinal = min.month * 100 + min.day
    const maxOrdinal = max.month * 100 + max.day
    return minOrdinal > maxOrdinal
      ? `Start date (${min.month}/${min.day}) must not be after end date (${max.month}/${max.day})`
      : null
  }

  /**
   * Constructs an ISO 8601 date string from year, month, and day.
   * Assumes all inputs are already validated.
   */
  function buildISODate(year: number, month: number, day: number): string {
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  return { daysInMonth, isValidMonthDay, validateRange, buildISODate }
}
```

---

### `MonthDayInput.vue` (new, internal sub-component)

**Location:** `src/components/report/MonthDayInput.vue`

A small wrapper used twice inside `ReportFilterBar` for the Min/Max date pickers. It exposes a `v-model` of `{ month, day } | null` and an `error` prop for inline error messages.

```typescript
interface MonthDayValue { month: number; day: number }

const props = defineProps<{
  modelValue: MonthDayValue | null
  label: string
  error?: string | null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: MonthDayValue | null): void
}>()
```

Internally it renders two `InputNumber` components (one for month 1–12, one for day 1–31) and emits the combined object when both have values, or `null` when both are cleared.

---

## Data Models

### Store state additions / changes in `report.ts`

The store already has `startDateFilter`, `endDateFilter`, `statusFilter`. The following changes are needed:

| Field | Current | After |
|---|---|---|
| `statusFilter` | `ref(['cancelled'])` | `ref([])` — default is now empty (= all statuses) |
| `minBsNumber` | `ref(undefined)` | **removed** — not used by the new UI |
| `maxBsNumber` | `ref(undefined)` | **removed** — not used by the new UI |
| `$reset()` | sets `statusFilter = []` | confirmed: set to `[]`, `minBsNumber`/`maxBsNumber` removed from reset |

> `minBsNumber`/`maxBsNumber` are removed because the new search bar replaces the BS-number range filter with an exact-match client-side lookup. The Supabase RPC parameters `min_bs` / `max_bs` will always be passed as `null`.

### `VoucherStatus` type (no change)

The existing `VoucherStatus` constant and union type in `src/types/VoucherStatus.ts` are used as-is. The `statusOptions` array in `ReportFilterBar` is built from it:

```typescript
const statusOptions = Object.entries(VoucherStatus).map(([key, value]) => ({
  key,
  text: value.text
}))
```

### Filtered row shape

`ReportTable` accepts `report` as `object[]` matching the existing Supabase RPC response shape. No new type is introduced — the Voucher report rows already include `customerName: string` and `bsNumber: number`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Status summary label

*For any* subset of `VoucherStatus` keys with cardinality ≥ 2, the summary label rendered by the Status_Filter SHALL be exactly the string `"${count} statuses selected"`.

**Validates: Requirements 1.3**

---

### Property 2: ISO date construction

*For any* year in the range [2018, currentYear], any month in [1, 12], and any day in [1, daysInMonth(year, month)], `buildISODate(year, month, day)` SHALL return a string of the form `"YYYY-MM-DD"` whose year, month, and day components exactly equal the inputs (with zero-padding).

**Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 3.2, 3.3**

---

### Property 3: Month-day validity

*For any* year, month, and day triple:
- If `month` is outside [1, 12] OR `day` is outside [1, daysInMonth(year, month)], `isValidMonthDay(year, month, day)` SHALL return `false`.
- If `month` is in [1, 12] AND `day` is in [1, daysInMonth(year, month)], `isValidMonthDay(year, month, day)` SHALL return `true`.
- In particular, `isValidMonthDay(nonLeapYear, 2, 29)` SHALL always return `false`.

**Validates: Requirements 3.7, 3.8**

---

### Property 4: Range validation

*For any* two valid month-day pairs A = (mA, dA) and B = (mB, dB):
- `validateRange(A, B)` SHALL return `null` (no error) when `mA * 100 + dA ≤ mB * 100 + dB`.
- `validateRange(A, B)` SHALL return a non-null error string when `mA * 100 + dA > mB * 100 + dB`.
- `validateRange(null, _)` and `validateRange(_, null)` SHALL always return `null`.

**Validates: Requirements 4.1, 4.2**

---

### Property 5: Client-side name search

*For any* non-empty, non-numeric search string `q` and *for any* array of report rows, the set of rows returned by the filter computed property SHALL be exactly the set of rows whose `customerName` field contains `q` as a case-insensitive substring.

**Validates: Requirements 5.2, 5.4**

---

### Property 6: Client-side BS-number search

*For any* positive integer `N` and *for any* array of report rows, the set of rows returned by the filter computed property for query `String(N)` SHALL contain exactly the union of:
- rows whose `customerName` case-insensitively contains the string `String(N)`, AND
- rows whose `bsNumber` exactly equals `N`.

**Validates: Requirements 5.3**

---

### Property 7: Filtered revenue sum

*For any* filtered subset of report rows, the `filteredRevenue` computed value SHALL equal the sum of `totalVoucherValue` across all rows in that subset.

**Validates: Requirements 5.8**

---

### Reflection: Redundancy Check

After reviewing all seven properties:

- **Properties 2 and 3** are complementary (not redundant): Property 2 tests correct output for valid inputs; Property 3 tests the guard that prevents Property 2 from being called with invalid inputs.
- **Properties 5 and 6** are complementary: Property 5 covers the non-numeric path; Property 6 covers the numeric path including the OR-union with name matching.
- **Property 7** does not overlap with 5 or 6 — it tests the revenue aggregation, not the row set membership.
- All seven properties are unique and provide non-overlapping validation value.

---

## Error Handling

### Invalid month/day input
- `isValidMonthDay` returns `false` → `ReportFilterBar` sets `minError` or `maxError` ref → PrimeVue `Message` with `severity="error"` renders inline below the offending input.
- `fillReport()` is not called while any error ref is non-null.

### Range conflict (min > max)
- `validateRange` returns an error string → `rangeError` ref is set → both `MonthDayInput` components receive the error string in their `error` prop.
- `fillReport()` is not called while `rangeError` is non-null.

### Concurrent fillReport calls
- `reportLoading` is already managed by the store (`reportLoading.value = true` before the call, `false` after).
- `Year_Selector` binds `:disabled="reportStore.reportLoading"`, preventing double-submission.
- Status filter and date inputs should similarly bind `:disabled="reportStore.reportLoading"` to prevent concurrent calls.

### API errors
- Existing `showErrorToast` in `ReportService.ts` handles Supabase errors — no change needed.

### Empty search result
- An empty `filteredReport` array is passed to `ReportTable`, which renders an empty `DataTable`. No special error state is needed — PrimeVue's DataTable handles empty data gracefully.

---

## Testing Strategy

### Unit tests (Vitest + `@vue/test-utils`)

Focused on specific examples and edge cases:

| Test | What is verified |
|---|---|
| `ReportFilterBar` mount renders all 8 status options | Req 1.1 |
| Selecting one status shows its label text | Req 1.2 |
| Selecting no statuses passes `null` to service | Req 1.5 (edge case) |
| Year selector is disabled when `reportLoading = true` | Req 2.8 |
| Year selector defaults to current year on mount | Req 2.2 |
| Clearing minDate resets startDateFilter to Jan 1 | Req 3.4 |
| Clearing maxDate resets endDateFilter to Dec 31 | Req 3.5 |
| Feb 29 in non-leap year shows validation error | Req 3.8 |
| Conflicting min/max shows error, no fillReport call | Req 4.2 |
| Resolving conflict removes error, calls fillReport | Req 4.3 |
| Empty search query returns full row set | Req 5.5 |
| Non-numeric query skips bsNumber matching | Req 5.4 |
| Search bar change does NOT call fillReport | Req 5.6 |
| Mount resets all store fields to defaults | Req 7.1–7.4 |
| Mount resets searchQuery to empty string | Req 7.5 |

### Property-based tests (fast-check, installed via `npm install --save-dev fast-check`)

Each test runs a minimum of 100 iterations. Tests are co-located with the utility under `src/composables/__tests__/dateFilterUtils.spec.ts` and with the view under `src/views/__tests__/ReportView.spec.ts`.

**Feature tag format:** `// Feature: report-advanced-filters, Property {N}: {title}`

#### `src/composables/__tests__/dateFilterUtils.spec.ts`

```typescript
// Feature: report-advanced-filters, Property 2: ISO date construction
it('buildISODate produces correct YYYY-MM-DD for any valid input', () => {
  fc.assert(fc.property(
    fc.integer({ min: 2018, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),  // 28 is safe for all months/years
    (year, month, day) => {
      const result = buildISODate(year, month, day)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const [y, m, d] = result.split('-').map(Number)
      expect(y).toBe(year)
      expect(m).toBe(month)
      expect(d).toBe(day)
    }
  ), { numRuns: 200 })
})

// Feature: report-advanced-filters, Property 3: Month-day validity
it('isValidMonthDay rejects out-of-range day for any month', () => {
  fc.assert(fc.property(
    fc.integer({ min: 2018, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 29, max: 99 }),  // candidate day that may be invalid
    (year, month, day) => {
      const maxDay = new Date(year, month, 0).getDate()
      const result = isValidMonthDay(year, month, day)
      expect(result).toBe(day <= maxDay)
    }
  ), { numRuns: 300 })
})

// Feature: report-advanced-filters, Property 4: Range validation
it('validateRange returns null iff min ordinal <= max ordinal', () => {
  fc.assert(fc.property(
    fc.record({ month: fc.integer({ min: 1, max: 12 }), day: fc.integer({ min: 1, max: 28 }) }),
    fc.record({ month: fc.integer({ min: 1, max: 12 }), day: fc.integer({ min: 1, max: 28 }) }),
    (minMD, maxMD) => {
      const result = validateRange(minMD, maxMD)
      const minOrd = minMD.month * 100 + minMD.day
      const maxOrd = maxMD.month * 100 + maxMD.day
      if (minOrd <= maxOrd) {
        expect(result).toBeNull()
      } else {
        expect(result).not.toBeNull()
        expect(typeof result).toBe('string')
      }
    }
  ), { numRuns: 200 })
})
```

#### `src/views/__tests__/reportFiltering.spec.ts`

```typescript
// Feature: report-advanced-filters, Property 1: Status summary label
it('summary label is "N statuses selected" for any subset of size >= 2', () => {
  const allKeys = Object.keys(VoucherStatus)
  fc.assert(fc.property(
    fc.array(fc.constantFrom(...allKeys), { minLength: 2, maxLength: allKeys.length }),
    (selected) => {
      const label = buildStatusSummaryLabel(selected)
      expect(label).toBe(`${selected.length} statuses selected`)
    }
  ), { numRuns: 100 })
})

// Feature: report-advanced-filters, Property 5: Client-side name search
it('name filter returns exactly rows matching case-insensitive substring', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      customerName: fc.string({ minLength: 1 }),
      bsNumber: fc.integer({ min: 1, max: 9999 }),
      totalVoucherValue: fc.float({ min: 0 })
    }), { minLength: 0, maxLength: 50 }),
    fc.string({ minLength: 1 }).filter(s => !/^\d+$/.test(s)), // non-numeric
    (rows, query) => {
      const result = applySearchFilter(rows, query)
      const lower = query.toLowerCase()
      result.forEach(row => expect(row.customerName.toLowerCase()).toContain(lower))
      rows.filter(r => r.customerName.toLowerCase().includes(lower))
          .forEach(r => expect(result).toContainEqual(r))
    }
  ), { numRuns: 200 })
})

// Feature: report-advanced-filters, Property 6: BS-number search
it('numeric query matches bsNumber OR customerName', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      customerName: fc.string({ minLength: 0 }),
      bsNumber: fc.integer({ min: 1, max: 9999 }),
      totalVoucherValue: fc.float({ min: 0 })
    }), { minLength: 0, maxLength: 50 }),
    fc.integer({ min: 1, max: 9999 }),
    (rows, n) => {
      const result = applySearchFilter(rows, String(n))
      const lower = String(n).toLowerCase()
      result.forEach(row => {
        const nameMatch = row.customerName.toLowerCase().includes(lower)
        const bsMatch = row.bsNumber === n
        expect(nameMatch || bsMatch).toBe(true)
      })
    }
  ), { numRuns: 200 })
})

// Feature: report-advanced-filters, Property 7: Filtered revenue sum
it('filteredRevenue equals sum of totalVoucherValue in filtered rows', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      customerName: fc.string(),
      bsNumber: fc.integer({ min: 1, max: 9999 }),
      totalVoucherValue: fc.float({ min: 0, max: 100000 })
    }), { minLength: 0, maxLength: 100 }),
    fc.string(),
    (rows, query) => {
      const filtered = applySearchFilter(rows, query)
      const revenue = computeFilteredRevenue(filtered)
      const expected = filtered.reduce((sum, r) => sum + r.totalVoucherValue, 0)
      expect(revenue).toBeCloseTo(expected, 5)
    }
  ), { numRuns: 200 })
})
```

> `applySearchFilter`, `buildStatusSummaryLabel`, and `computeFilteredRevenue` are exported pure functions extracted from the computed logic in `ReportView`. This ensures they can be tested in isolation without mounting the component.

### Integration tests

Not required beyond the unit/property coverage above — the Supabase call path is already exercised by existing manual testing and the existing `showErrorToast` error handler. The `fillReport()` call is verified in unit tests by asserting the store's `getReport` dependency is called with correct arguments (using `vi.mock`).

### Layout / responsive tests

The breakpoint behavior (≥768px → row, <768px → column) is implemented via a CSS media query in `ReportFilterBar.vue` using a single `.filter-bar` class. No JavaScript is required and no automated responsive test is planned — visual QA covers this.