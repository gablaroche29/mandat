"use client"

import { useState, useEffect, useCallback } from "react"
import { Invoice } from "@/types/invoice"

const STORAGE_KEY = "leviat-invoices-v1"

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setInvoices(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const persist = useCallback((data: Invoice[]) => {
    setInvoices(data)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [])

  const addInvoice = useCallback(
    (inv: Invoice) => persist([inv, ...invoices]),
    [invoices, persist]
  )

  const togglePaid = useCallback(
    (id: string) =>
      persist(invoices.map((i) => (i.id === id ? { ...i, paid: !i.paid } : i))),
    [invoices, persist]
  )

  const deleteInvoice = useCallback(
    (id: string) => persist(invoices.filter((i) => i.id !== id)),
    [invoices, persist]
  )

  return { invoices, loaded, addInvoice, togglePaid, deleteInvoice }
}
