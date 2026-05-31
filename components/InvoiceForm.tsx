"use client"

import { useState, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Invoice, LineItem } from "@/types/invoice"

const DEFAULT_RATE = 35
const TODAY = new Date().toISOString().split("T")[0]
const IN_30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"
}

function genId() {
  return Math.random().toString(36).slice(2)
}

function nextInvoiceNum(invoices: Invoice[]) {
  const year = new Date().getFullYear()
  const count = invoices.filter((i) => i.number.startsWith(`${year}-`)).length
  return `${year}-${String(count + 1).padStart(3, "0")}`
}

interface Props {
  invoices: Invoice[]
  onSave: (inv: Invoice) => void
  defaultMyName?: string
  defaultMyNeq?: string
  defaultMyAddress?: string
  defaultMyEmail?: string
  defaultClientName?: string
  defaultClientNeq?: string
  defaultClientAddress?: string
}

export function InvoiceForm({
  invoices,
  onSave,
  defaultMyName = "",
  defaultMyNeq = "",
  defaultMyAddress = "",
  defaultMyEmail = "",
  defaultClientName = "",
  defaultClientNeq = "",
  defaultClientAddress = "",
}: Props) {
  const [number, setNumber] = useState(nextInvoiceNum(invoices))
  const [issueDate, setIssueDate] = useState(TODAY)
  const [dueDate, setDueDate] = useState(IN_30)
  const [deliveryDate, setDeliveryDate] = useState(TODAY)

  const [myName, setMyName] = useState(defaultMyName)
  const [myNeq, setMyNeq] = useState(defaultMyNeq)
  const [myAddress, setMyAddress] = useState(defaultMyAddress)
  const [myEmail, setMyEmail] = useState(defaultMyEmail)

  const [clientName, setClientName] = useState(defaultClientName)
  const [clientNeq, setClientNeq] = useState(defaultClientNeq)
  const [clientAddress, setClientAddress] = useState(defaultClientAddress)

  const [lines, setLines] = useState<LineItem[]>([
    { id: genId(), description: "", quantity: 0, rate: DEFAULT_RATE },
  ])
  const [transport, setTransport] = useState(0)
  const [notes, setNotes] = useState("Paiement dû dans les 30 jours suivant réception.")

  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.rate, 0)
  const total = subtotal + transport

  const addLine = useCallback(() => {
    setLines((prev) => [
      ...prev,
      { id: genId(), description: "", quantity: 0, rate: DEFAULT_RATE },
    ])
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateLine = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
      )
    },
    []
  )

  const handleSave = () => {
    if (!number.trim()) return alert("Numéro de facture requis.")
    if (!myName.trim()) return alert("Votre nom est requis.")
    if (!clientName.trim()) return alert("Nom du client requis.")
    if (lines.length === 0) return alert("Ajoutez au moins une ligne.")

    const inv: Invoice = {
      id: genId(),
      number: number.trim(),
      issueDate,
      dueDate,
      deliveryDate,
      myName,
      myNeq,
      myAddress,
      myEmail,
      clientName,
      clientNeq,
      clientAddress,
      lines,
      transport,
      subtotal,
      total,
      notes,
      paid: false,
      createdAt: new Date().toISOString(),
    }
    onSave(inv)
    // Reset for next invoice, keep personal/client info
    setNumber(nextInvoiceNum([inv, ...invoices]))
    setLines([{ id: genId(), description: "", quantity: 0, rate: DEFAULT_RATE }])
    setTransport(0)
    setIssueDate(TODAY)
    setDueDate(IN_30)
    setDeliveryDate(TODAY)
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Invoice meta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Facture
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="num">Numéro</Label>
            <Input id="num" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue">Date d&apos;émission</Label>
            <Input id="issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delivery">Date de livraison</Label>
            <Input id="delivery" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due">Date d&apos;échéance</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom complet</Label>
              <Input placeholder="Jean Tremblay" value={myName} onChange={(e) => setMyName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input placeholder="123 rue Principale, Montréal, QC H1A 1A1" value={myAddress} onChange={(e) => setMyAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Courriel</Label>
              <Input type="email" placeholder="jean@email.com" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>NEQ (si applicable)</Label>
              <Input placeholder="—" value={myNeq} onChange={(e) => setMyNeq(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom / Entreprise</Label>
              <Input placeholder="Leviat Legal" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input placeholder="Adresse du client" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>NEQ</Label>
              <Input placeholder="—" value={clientNeq} onChange={(e) => setClientNeq(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header */}
          <div className="mb-2 grid grid-cols-[1fr_80px_80px_36px] gap-2">
            <span className="text-xs text-muted-foreground">Description</span>
            <span className="text-xs text-muted-foreground text-right">Heures</span>
            <span className="text-xs text-muted-foreground text-right">$/h</span>
            <span />
          </div>

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[1fr_80px_80px_36px] gap-2 items-center">
                <Input
                  placeholder="Développement intégration Missive/Clio..."
                  value={line.description}
                  onChange={(e) => updateLine(line.id, "description", e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  className="text-right"
                  value={line.quantity}
                  onChange={(e) => updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  className="text-right"
                  value={line.rate}
                  onChange={(e) => updateLine(line.id, "rate", parseFloat(e.target.value) || 0)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="mt-3" onClick={addLine}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
          </Button>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground shrink-0">Transport ($)</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="h-7 w-24 text-right text-sm"
                  value={transport}
                  onChange={(e) => setTransport(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TPS (0 %)</span>
                <span>sans objet</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TVQ (0 %)</span>
                <span>sans objet</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label>Notes / conditions de paiement</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>
        Enregistrer la facture
      </Button>
    </div>
  )
}
