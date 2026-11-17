import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://previx-sst.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PREVIX SST | Gestão de Segurança do Trabalho em Maceió",
    template: "%s | PREVIX SST",
  },
  description:
    "Organize a gestão de SST da sua empresa com o PREVIX: funcionários, EPIs, extintores, inspeções, documentos, exames e prazos. Atendimento em Maceió e região.",
  applicationName: "PREVIX SST",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "PREVIX SST",
    title: "PREVIX SST | Gestão de Segurança do Trabalho em Maceió",
    description:
      "Sistema para organizar registros, documentos, equipamentos e prazos de SST. Conheça o PREVIX e fale com nossa equipe em Maceió.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', background: '#f1f5f9' }}>{children}</body>
    </html>
  )
}