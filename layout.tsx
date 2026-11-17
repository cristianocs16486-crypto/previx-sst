
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "PREVIX SST | Sistema de Gestão de Segurança do Trabalho",

  description:
    "Simplifique a gestão de Segurança e Saúde no Trabalho com o PREVIX SST. Controle EPIs, documentos, inspeções, extintores e prazos em uma única plataforma.",

  keywords: [
    "gestão SST",
    "sistema de gestão SST",
    "software SST",
    "controle de EPI",
    "gestão de EPIs",
    "segurança do trabalho",
    "saúde e segurança ocupacional",
    "controle de documentos SST",
    "inspeções de segurança",
  ],

  alternates: {
    canonical: "https://previx-sst.vercel.app/gestao-sst",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://previx-sst.vercel.app/gestao-sst",
    siteName: "PREVIX SST",
    title: "PREVIX SST | Gestão Inteligente de SST",
    description:
      "Gerencie EPIs, documentos, inspeções e prazos de Segurança e Saúde no Trabalho em uma única plataforma.",
  },

  twitter: {
    card: "summary_large_image",
    title: "PREVIX SST | Gestão de Segurança do Trabalho",
    description:
      "Uma plataforma para simplificar a gestão de SST da sua empresa.",
  },
};

export default function GestaoSSTLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
