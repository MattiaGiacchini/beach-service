export interface MonthlyRevenueEntry {
  month: string
  totalRevenue: number
  friendly: boolean
}

export const ChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  }
}
