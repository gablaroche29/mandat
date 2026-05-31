"use client"

import { useState } from "react"
import { FileDown, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Invoice } from "@/types/invoice"

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"
}

function fmtDate(d: string) {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

interface Props {
  invoices: Invoice[]
  onTogglePaid: (id: string) => void
  onDelete: (id: string) => void
}

export function InvoiceList({ invoices, onTogglePaid, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Aucune facture enregistrée</p>
      </div>
    )
  }

  async function handleExport(inv: Invoice) {
    const { exportInvoicePDF } = await import("@/lib/pdf")
    exportInvoicePDF(inv)
  }

  return (
    <div className="space-y-2 pb-10">
      {invoices.map((inv) => {
        const open = expanded === inv.id
        return (
          <Card key={inv.id} className="overflow-hidden">
            {/* Row */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-muted/40 transition-colors"
              onClick={() => setExpanded(open ? null : inv.id)}
            >
              <span className="font-mono text-sm font-medium w-24 shrink-0">{inv.number}</span>
              <span className="text-sm flex-1 truncate">{inv.clientName}</span>
              <span className="text-sm font-semibold w-28 text-right shrink-0">{fmt(inv.total)}</span>
              <span className="text-xs text-muted-foreground w-24 text-right shrink-0 hidden sm:block">
                {fmtDate(inv.dueDate)}
              </span>
              <Badge variant={inv.paid ? "success" : "warning"} className="w-20 justify-center shrink-0">
                {inv.paid ? "Payée" : "En attente"}
              </Badge>
              {open ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>

            {/* Expanded detail */}
            {open && (
              <CardContent className="border-t bg-muted/20 px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Émission</p>
                    <p>{fmtDate(inv.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Livraison</p>
                    <p>{fmtDate(inv.deliveryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Échéance</p>
                    <p>{fmtDate(inv.dueDate)}</p>
                  </div>
                </div>

                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left pb-1 font-normal">Description</th>
                      <th className="text-right pb-1 font-normal w-16">Heures</th>
                      <th className="text-right pb-1 font-normal w-20">Taux</th>
                      <th className="text-right pb-1 font-normal w-24">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.lines.map((l) => (
                      <tr key={l.id} className="border-b last:border-0">
                        <td className="py-1.5">{l.description || "—"}</td>
                        <td className="py-1.5 text-right">{l.quantity}</td>
                        <td className="py-1.5 text-right">{fmt(l.rate)}</td>
                        <td className="py-1.5 text-right">{fmt(l.quantity * l.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{fmt(inv.total)}</span>
                </div>

                {inv.notes && (
                  <p className="mt-3 text-xs text-muted-foreground border-t pt-2">{inv.notes}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTogglePaid(inv.id)}
                  >
                    {inv.paid ? (
                      <><Circle className="h-3.5 w-3.5 mr-1" /> Marquer non payée</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Marquer payée</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(inv)}
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Exporter PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Supprimer cette facture ?")) onDelete(inv.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
