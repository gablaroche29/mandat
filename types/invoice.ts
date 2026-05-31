export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export interface Invoice {
  id: string
  number: string
  issueDate: string
  dueDate: string
  deliveryDate: string
  myName: string
  myNeq: string
  myAddress: string
  myEmail: string
  clientName: string
  clientNeq: string
  clientAddress: string
  lines: LineItem[]
  transport: number
  subtotal: number
  total: number
  notes: string
  paid: boolean
  createdAt: string
}
