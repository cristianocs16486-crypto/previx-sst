
import type { Metadata } from "next";
import type { ReactNode } from "react";

const pageUrl = "https://previx-sst.vercel.app/gestao-sst";

export const metadata: Metadata = {
  title: {
    absolute: "Sistema de Gestão SST | Controle de EPI e Segurança do Trabalho - PREVIX",
  },

  description:
    "Conheça o PREVIX SST, sistema de gestão de Segurança e Saúde no Trabalho. Organize EPIs, inspeções, extintores, documentos, exames e prazos em uma única plataforma.",

  alternates: {
    canonical: pageUrl,
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
    url: pageUrl,
    siteName: "PREVIX SST",
    title: "PREVIX SST | Sistema de Gestão de Segurança do Trabalho",
    description:
      "Simplifique a gestão de SST da sua empresa. Controle EPIs, documentos, inspeções e prazos em uma única plataforma.",
  },

  twitter: {
    card: "summary_large_image",
    title: "PREVIX SST | Gestão de SST",
    description:
      "Conheça uma plataforma para organizar a gestão de Segurança e Saúde no Trabalho.",
  },
};

export default function GestaoSSTLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
