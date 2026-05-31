"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { useInvoices } from "@/hooks/useInvoices"
import { InvoiceForm } from "@/components/InvoiceForm"
import { InvoiceList } from "@/components/InvoiceList"
import { Summary } from "@/components/Summary"
import { Invoice } from "@/types/invoice"

type Tab = "new" | "history" | "summary"

export default function Home() {
  const { invoices, loaded, addInvoice, togglePaid, deleteInvoice } = useInvoices()
  const [tab, setTab] = useState<Tab>("new")
  const [lastSaved, setLastSaved] = useState<Invoice | null>(null)

  function handleSave(inv: Invoice) {
    addInvoice(inv)
    setLastSaved(inv)
    setTab("history")
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "new", label: "Nouvelle facture" },
    { id: "history", label: "Historique" + (invoices.length ? " (" + invoices.length + ")" : "") },
    { id: "summary", label: "Sommaire" },
  ]

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground text-sm">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-sm font-semibold tracking-tight">Mandat</h1>
          <span className="text-xs text-muted-foreground">— Leviat Legal</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {lastSaved && tab === "history" && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 flex justify-between items-center">
            <span>Facture <strong>{lastSaved.number}</strong> enregistrée.</span>
            <button onClick={() => setLastSaved(null)} className="text-xs underline opacity-70 hover:opacity-100">OK</button>
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={"px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " + (
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "new" && (
          <InvoiceForm invoices={invoices} onSave={handleSave} defaultClientName="Leviat Legal" />
        )}
        {tab === "history" && (
          <InvoiceList invoices={invoices} onTogglePaid={togglePaid} onDelete={deleteInvoice} />
        )}
        {tab === "summary" && <Summary invoices={invoices} />}
      </div>
    </div>
  )
}
