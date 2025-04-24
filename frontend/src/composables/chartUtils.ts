import type { MonthlyRevenueEntry } from '@/types/Chart'

const colors = [
  '--p-blue-200',
  '--p-blue-300',
  '--p-blue-400',
  '--p-blue-500',
  '--p-blue-600',
  '--p-blue-700',
  '--p-blue-800',
  '--p-blue-900'
]

const MONTH_LABELS = ['May', 'Jun', 'Jul', 'Aug', 'Sep']

export type VoucherData = {
  year: number
  friendly: boolean
  totalVouchers: number
  totalPeople: string
  totalRevenue: number
}

export function useMonthlyRevenueChart() {
  const monthlyRevenue = (
    rawData: MonthlyRevenueEntry[],
    type: 'friendly' | 'nonFriendly' = 'nonFriendly'
  ) => {
    const yearsMap: Record<string, number[]> = {}

    rawData.forEach(({ month, totalRevenue, friendly }) => {
      const shouldInclude = type === 'friendly' ? friendly : !friendly
      if (!shouldInclude) return

      const date = new Date(month)
      const year = date.getFullYear().toString()
      const monthIndex = date.getMonth()

      if (monthIndex >= 4 && monthIndex <= 8) {
        if (!yearsMap[year]) {
          yearsMap[year] = new Array(5).fill(0)
        }
        const validMonthIndex = monthIndex - 4
        yearsMap[year][validMonthIndex] = totalRevenue
      }
    })

    const documentStyle = getComputedStyle(document.documentElement)

    const datasets = Object.entries(yearsMap).map(([year, revenues], index) => {
      const color = documentStyle.getPropertyValue(colors[index % colors.length]).trim()
      return {
        label: year,
        data: revenues,
        backgroundColor: color,
        borderColor: color
      }
    })

    return {
      labels: MONTH_LABELS,
      datasets
    }
  }

  const yearlyStats = (rawData: VoucherData[]) => {
    const documentStyle = getComputedStyle(document.documentElement)
    const color = documentStyle.getPropertyValue(colors[3]).trim()
    const friendlyColor = documentStyle.getPropertyValue(colors[1]).trim()

    const years = Array.from(new Set(rawData.map((item) => item.year))).sort((a, b) => a - b)

    const revenueFriendly: number[] = []
    const revenueNonFriendly: number[] = []
    const voucherFriendly: number[] = []
    const voucherNonFriendly: number[] = []
    const totalPeople: number[] = []

    years.forEach((year) => {
      const yearEntries = rawData.filter((entry) => entry.year === year)
      let sumRevenueFriendly = 0
      let sumRevenueNonFriendly = 0
      let sumVoucherFriendly = 0
      let sumVoucherNonFriendly = 0
      let sumPeople = 0

      yearEntries.forEach((entry) => {
        if (entry.friendly) {
          sumRevenueFriendly += entry.totalRevenue
          sumVoucherFriendly += entry.totalVouchers
        } else {
          sumRevenueNonFriendly += entry.totalRevenue
          sumVoucherNonFriendly += entry.totalVouchers
        }
        sumPeople += parseInt(entry.totalPeople)
      })

      revenueFriendly.push(sumRevenueFriendly)
      revenueNonFriendly.push(sumRevenueNonFriendly)
      voucherFriendly.push(sumVoucherFriendly)
      voucherNonFriendly.push(sumVoucherNonFriendly)
      totalPeople.push(sumPeople)
    })

    const yearlyRevenueCharts = {
      labels: years.map((year) => year.toString()),
      datasets: [
        {
          label: 'BS Voucher Revenue',
          data: revenueNonFriendly,
          backgroundColor: color,
          borderColor: color,
          stack: 'revenue'
        },
        {
          label: 'A Voucher Revenue',
          data: revenueFriendly,
          backgroundColor: friendlyColor,
          borderColor: friendlyColor,
          stack: 'revenue'
        }
      ]
    }

    const yearlyVoucherCharts = {
      labels: years.map((year) => year.toString()),
      datasets: [
        {
          label: 'BS Voucher Amount',
          data: voucherNonFriendly,
          backgroundColor: color,
          borderColor: color,
          stack: 'voucher'
        },
        {
          label: 'A Voucher Amount',
          data: voucherFriendly,
          backgroundColor: friendlyColor,
          borderColor: friendlyColor,
          stack: 'voucher'
        }
      ]
    }

    const peopleChart = {
      labels: years.map((year) => year.toString()),
      datasets: [
        {
          label: 'Total People',
          data: totalPeople,
          backgroundColor: friendlyColor,
          borderColor: friendlyColor
        }
      ]
    }

    return {
      yearlyRevenueCharts,
      yearlyVoucherCharts,
      peopleChart
    }
  }

  return {
    monthlyRevenue,
    yearlyStats
  }
}
