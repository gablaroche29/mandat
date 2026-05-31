"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Invoice } from "@/types/invoice"

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"
}

interface Props {
  invoices: Invoice[]
}

export function Summary({ invoices }: Props) {
  const total = invoices.reduce((a, i) => a + i.total, 0)
  const paid = invoices.filter((i) => i.paid).reduce((a, i) => a + i.total, 0)
  const unpaid = total - paid
  const count = invoices.length
  const paidCount = invoices.filter((i) => i.paid).length

  // Group by year
  const byYear: Record<string, { total: number; paid: number; count: number; paidCount: number }> = {}
  invoices.forEach((inv) => {
    const y = inv.issueDate?.slice(0, 4) || "?"
    if (!byYear[y]) byYear[y] = { total: 0, paid: 0, count: 0, paidCount: 0 }
    byYear[y].total += inv.total
    byYear[y].count += 1
    if (inv.paid) {
      byYear[y].paid += inv.total
      byYear[y].paidCount += 1
    }
  })

  const THRESHOLD = 30000

  return (
    <div className="space-y-5 pb-10">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total facturé", value: fmt(total) },
          { label: "Reçu", value: fmt(paid) },
          { label: "En attente", value: fmt(unpaid) },
          { label: "Factures", value: `${paidCount} / ${count}` },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-xl font-semibold tabular-nums">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* By year */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Par année fiscale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(byYear).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée</p>
          ) : (
            <div className="space-y-0">
              {Object.entries(byYear)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, data]) => {
                  const pct = Math.min((data.total / THRESHOLD) * 100, 100)
                  const overThreshold = data.total > THRESHOLD
                  return (
                    <div key={year} className="py-4 border-b last:border-0">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="font-semibold">{year}</span>
                          <span className="text-xs text-muted-foreground ml-3">
                            {data.count} facture{data.count > 1 ? "s" : ""} · {data.paidCount} payée{data.paidCount > 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className={`font-semibold tabular-nums ${overThreshold ? "text-destructive" : ""}`}>
                          {fmt(data.total)}
                        </span>
                      </div>
                      {/* Progress bar toward 30k threshold */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${overThreshold ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Seuil TPS/TVQ : {fmt(THRESHOLD)}</span>
                        <span>{pct.toFixed(0)} %</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>Rappel fiscal :</strong> Si tes revenus de travailleur autonome dépassent 30 000 $ sur 4 trimestres civils consécutifs, tu dois t&apos;inscrire aux fichiers de la TPS et TVQ et commencer à les percevoir.
      </div>
    </div>
  )
}
