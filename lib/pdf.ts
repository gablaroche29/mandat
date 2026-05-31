import { Invoice } from "@/types/invoice"

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"
}

function fmtDate(d: string) {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

export async function exportInvoicePDF(inv: Invoice) {
  const { default: jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const W = 210
  const margin = 20

  // --- Colors ---
  const black = [15, 15, 15] as [number, number, number]
  const muted = [120, 120, 120] as [number, number, number]
  const light = [245, 245, 243] as [number, number, number]
  const border = [220, 220, 218] as [number, number, number]

  doc.setFont("helvetica")

  // Top bar
  doc.setFillColor(...light)
  doc.rect(0, 0, W, 18, "F")

  // FACTURE label
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  doc.text("FACTURE", margin, 11)

  // Invoice number right
  doc.setFontSize(9)
  doc.setTextColor(...black)
  doc.text(inv.number, W - margin, 11, { align: "right" })

  // Divider
  doc.setDrawColor(...border)
  doc.setLineWidth(0.3)
  doc.line(margin, 20, W - margin, 20)

  // --- Emetteur / Client side by side ---
  let y = 30

  doc.setFontSize(7.5)
  doc.setTextColor(...muted)
  doc.text("DE", margin, y)
  doc.text("À", W / 2 + 5, y)

  y += 5
  doc.setFontSize(10)
  doc.setTextColor(...black)
  doc.setFont("helvetica", "bold")
  doc.text(inv.myName, margin, y)
  doc.text(inv.clientName, W / 2 + 5, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(...muted)

  const myLines: string[] = []
  if (inv.myAddress) myLines.push(inv.myAddress)
  if (inv.myEmail) myLines.push(inv.myEmail)
  if (inv.myNeq) myLines.push("NEQ : " + inv.myNeq)

  const clLines: string[] = []
  if (inv.clientAddress) clLines.push(inv.clientAddress)
  if (inv.clientNeq) clLines.push("NEQ : " + inv.clientNeq)

  const maxLines = Math.max(myLines.length, clLines.length)
  for (let i = 0; i < maxLines; i++) {
    y += 5
    if (myLines[i]) doc.text(myLines[i], margin, y)
    if (clLines[i]) doc.text(clLines[i], W / 2 + 5, y)
  }

  // Vertical separator
  doc.setDrawColor(...border)
  doc.setLineWidth(0.3)
  doc.line(W / 2, 28, W / 2, y + 4)

  y += 10

  // --- Dates row ---
  doc.setFillColor(...light)
  doc.roundedRect(margin, y, W - margin * 2, 18, 2, 2, "F")

  const dateFields = [
    { label: "Date d'émission", value: fmtDate(inv.issueDate) },
    { label: "Date de livraison", value: fmtDate(inv.deliveryDate) },
    { label: "Date d'échéance", value: fmtDate(inv.dueDate) },
  ]
  const colW = (W - margin * 2) / 3
  dateFields.forEach((f, i) => {
    const x = margin + i * colW + colW / 2
    doc.setFontSize(7)
    doc.setTextColor(...muted)
    doc.text(f.label.toUpperCase(), x, y + 6, { align: "center" })
    doc.setFontSize(9)
    doc.setTextColor(...black)
    doc.text(f.value, x, y + 13, { align: "center" })
  })

  y += 26

  // --- Line items table ---
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Description", "Heures", "Taux / h", "Montant"]],
    body: inv.lines.map((l) => [
      l.description,
      l.quantity.toString(),
      fmt(l.rate),
      fmt(l.quantity * l.rate),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: black,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    headStyles: {
      fillColor: black,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: light },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 22, halign: "right" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 32, halign: "right" },
    },
    tableLineColor: border,
    tableLineWidth: 0.3,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8

  // --- Totals block ---
  const totalsX = W - margin - 72
  const totalsW = 72

  const rows = [
    { label: "Sous-total", value: fmt(inv.subtotal) },
    ...(inv.transport > 0 ? [{ label: "Transport", value: fmt(inv.transport) }] : []),
    { label: "TPS (0 %)", value: "— sans objet" },
    { label: "TVQ (0 %)", value: "— sans objet" },
  ]

  rows.forEach((r) => {
    doc.setFontSize(8.5)
    doc.setTextColor(...muted)
    doc.text(r.label, totalsX, y)
    doc.setTextColor(...black)
    doc.text(r.value, totalsX + totalsW, y, { align: "right" })
    y += 6
  })

  // Total line
  doc.setDrawColor(...border)
  doc.setLineWidth(0.3)
  doc.line(totalsX, y, totalsX + totalsW, y)
  y += 5

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...black)
  doc.text("Total", totalsX, y)
  doc.text(fmt(inv.total), totalsX + totalsW, y, { align: "right" })
  doc.setFont("helvetica", "normal")

  y += 12

  // --- Notes ---
  if (inv.notes) {
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text("Notes", margin, y)
    y += 4
    doc.setTextColor(...black)
    doc.setFontSize(8.5)
    const noteLines = doc.splitTextToSize(inv.notes, W - margin * 2)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4.5
  }

  // --- Footer ---
  doc.setFontSize(7.5)
  doc.setTextColor(...muted)
  doc.text(
    "Document généré le " + new Date().toLocaleDateString("fr-CA"),
    W / 2,
    285,
    { align: "center" }
  )

  doc.save(`facture-${inv.number}.pdf`)
}
