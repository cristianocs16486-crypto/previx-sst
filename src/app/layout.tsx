export const metadata = {
  title: 'PREVIX - Prevenção que Protege',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', background: '#f1f5f9' }}>{children}</body>
    </html>
  )
}