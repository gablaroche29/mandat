import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mandat — Leviat Legal",
  description: "Application de facturation pour travailleurs autonomes",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
