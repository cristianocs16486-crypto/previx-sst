import './globals.css'

export const metadata = {
  title: 'PREVIX - Prevenção que Protege',
  description: 'Painel SST',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}