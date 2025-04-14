export const VoucherStatus: {
  [key: string]: {
    color: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
    icon: string
    text: string
  }
} = {
  draft: {
    color: 'secondary',
    icon: 'pi pi-pencil',
    text: 'Draft'
  },
  readyForApproval: {
    color: 'info',
    icon: 'pi pi-clock',
    text: 'Ready for Approval'
  },
  approved: {
    color: 'warn',
    icon: 'pi pi-check',
    text: 'Approved'
  },
  cancelled: {
    color: 'success',
    icon: 'pi pi-ban',
    text: 'Cancelled'
  },
  paid: {
    color: 'success',
    icon: 'pi pi-credit-card',
    text: 'Paid'
  },
  rejected: {
    color: 'danger',
    icon: 'pi pi-folder',
    text: 'Rejected'
  },
  closed: {
    color: 'danger',
    icon: 'pi pi-folder',
    text: 'Closed'
  },
  pendingPayment: {
    color: 'warn',
    icon: 'pi pi-exclamation-triangle',
    text: 'Pending Payment'
  }
}

export const VoucherStatuses = [
  { text: 'draft' },
  { text: 'readyForApproval' },
  { text: 'approved' },
  { text: 'cancelled' },
  { text: 'paid' },
  { text: 'rejected' },
  { text: 'closed' },
  { text: 'pendingPayment' }
]
