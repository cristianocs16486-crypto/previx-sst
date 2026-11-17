import type { Metadata } from "next";
import Image from "next/image";

const siteUrl = "https://previx-sst.vercel.app";
const whatsappUrl =
  "https://wa.me/5582994145622?text=Ol%C3%A1%2C%20quero%20conhecer%20o%20PREVIX%20SST.";

export const metadata: Metadata = {
  title: "Sistema de Gestão de SST em Maceió",
  description:
    "Conheça o PREVIX SST, sistema para organizar funcionários, EPIs, extintores, inspeções, documentos, exames e prazos de segurança do trabalho em Maceió e região.",
  alternates: { canonical: "/gestao-sst" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${siteUrl}/gestao-sst`,
    title: "Sistema de Gestão de SST em Maceió | PREVIX SST",
    description:
      "Organize informações e rotinas de segurança do trabalho em um só lugar. Atendimento em Maceió e região.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "PREVIX SST",
      url: siteUrl,
      email: "previxsst1@gmail.com",
      telephone: "+55 82 99414-5622",
      areaServed: {
        "@type": "City",
        name: "Maceió",
        containedInPlace: { "@type": "State", name: "Alagoas" },
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "PREVIX SST",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${siteUrl}/gestao-sst`,
      description:
        "Plataforma web de gestão de SST para organizar funcionários, EPIs, extintores, inspeções, documentos, exames, riscos e relatórios.",
    },
  ],
};

const features = [
  {
    title: "Equipe e equipamentos de proteção",
    description:
      "Cadastre funcionários, registre EPIs e mantenha informações de entrega e consulta organizadas.",
  },
  {
    title: "Inspeções e prevenção",
    description:
      "Centralize inspeções, riscos ocupacionais e dados de extintores, incluindo datas de recarga.",
  },
  {
    title: "Saúde ocupacional",
    description:
      "Organize informações de exames ocupacionais e clínicas relacionadas aos atendimentos.",
  },
  {
    title: "Documentos, prazos e relatórios",
    description:
      "Reúna documentos e acompanhe datas; gere relatórios a partir dos dados cadastrados no sistema.",
  },
  {
    title: "Responsável técnico",
    description:
      "Mantenha os dados do responsável técnico acessíveis junto às informações da empresa.",
  },
  {
    title: "Organização administrativa",
    description:
      "Consulte também registros administrativos e financeiros relacionados à operação.",
  },
];

export default function GestaoSstPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-lime-50 text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="border-b border-teal-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="/gestao-sst" className="text-xl font-black tracking-tight text-teal-900">
            PREVIX <span className="text-teal-600">SST</span>
          </a>
          <a
            href="/"
            className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50"
          >
            Acessar sistema
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_0.7fr] md:items-center md:py-24">
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-teal-700">
            Gestão de Segurança e Saúde no Trabalho
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
            Organize a gestão de SST da sua empresa em um só lugar
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            O PREVIX SST é uma plataforma web para gestão e organização das
            informações de Segurança e Saúde no Trabalho. Em vez de espalhar
            registros em diferentes arquivos, sua empresa pode reunir dados da
            equipe, EPIs, inspeções, documentos, exames e prazos em um painel.
            Atendimento em Maceió e região.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800"
            >
              Fale conosco pelo WhatsApp
            </a>
            <a
              href="mailto:previxsst1@gmail.com?subject=Quero%20conhecer%20o%20PREVIX%20SST"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:border-teal-600 hover:text-teal-800"
            >
              Enviar e-mail
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Atendimento comercial: Maceió e região, Alagoas.
          </p>
        </div>

        <figure className="overflow-hidden rounded-3xl border border-teal-100 bg-white p-2 shadow-2xl shadow-teal-900/10">
          <Image
            src="/previx-dashboard-preview.svg"
            alt="Prévia ilustrativa do painel PREVIX SST, com menu de módulos, indicadores e acesso a informações de segurança do trabalho."
            width={1280}
            height={760}
            priority
            className="h-auto w-full rounded-2xl"
          />
          <figcaption className="px-3 py-3 text-center text-xs text-slate-500">
            Prévia ilustrativa do painel PREVIX SST. Os dados exibidos são exemplos.
          </figcaption>
        </figure>
      </section>

      <section id="o-que-e" className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700">
            O que é o PREVIX?
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Um sistema para centralizar a rotina de SST da empresa
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            PREVIX SST é um sistema de gestão de segurança do trabalho que
            permite registrar e consultar informações importantes da operação
            em um só ambiente. O painel reúne módulos para empresas e seus
            dados, com acesso organizado por conta, ajudando a equipe a
            encontrar registros e acompanhar o que foi cadastrado.
          </p>
          <p className="mt-4 leading-7 text-slate-600">
            A plataforma foi pensada para empresas que precisam acompanhar
            informações de saúde e segurança ocupacional no dia a dia e para
            profissionais que apoiam essa organização. O PREVIX funciona pela
            internet e pode ser acessado pelo navegador.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700">
              Recursos do sistema
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              O que dá para organizar no PREVIX SST
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Os módulos ajudam a manter registros de SST consultáveis e
              relacionados à empresa atendida.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-teal-100 bg-teal-50/60 p-6"
              >
                <h3 className="text-lg font-black text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Da organização dos dados à consulta dos registros
            </h2>
            <ol className="mt-6 space-y-5">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 font-black text-white">1</span>
                <p className="leading-7 text-slate-600">
                  <strong className="text-slate-800">Organize o acesso:</strong>{" "}
                  os usuários entram no painel conforme sua conta e empresa.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 font-black text-white">2</span>
                <p className="leading-7 text-slate-600">
                  <strong className="text-slate-800">Registre as informações:</strong>{" "}
                  cadastros, equipamentos, documentos e demais dados ficam nos
                  módulos correspondentes.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 font-black text-white">3</span>
                <p className="leading-7 text-slate-600">
                  <strong className="text-slate-800">Consulte e acompanhe:</strong>{" "}
                  utilize as buscas, indicadores, prazos e relatórios para
                  apoiar a rotina da empresa.
                </p>
              </li>
            </ol>
          </div>
          <aside className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
            <h2 className="text-xl font-black text-slate-900">
              Importante sobre documentos e conformidade
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              O PREVIX organiza informações e pode gerar relatórios com base
              nos dados cadastrados. A plataforma, por si só, não substitui
              avaliação do ambiente de trabalho, elaboração ou validação de
              laudos e programas, nem a atuação de profissional legalmente
              habilitado quando necessária. Revise os dados e confirme a
              aplicabilidade das normas à realidade da empresa.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-y border-teal-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-black text-slate-900">
            Dúvidas sobre o sistema de gestão de SST
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <article>
              <h3 className="font-black text-slate-900">
                O PREVIX é um sistema online?
              </h3>
              <p className="mt-2 leading-7 text-slate-600">
                Sim. O PREVIX SST é acessado pela internet, em um navegador,
                usando uma conta de acesso.
              </p>
            </article>
            <article>
              <h3 className="font-black text-slate-900">
                Quais informações posso organizar?
              </h3>
              <p className="mt-2 leading-7 text-slate-600">
                O sistema reúne módulos de funcionários, EPIs, extintores,
                inspeções, documentos, exames, clínicas, PGR e riscos,
                responsável técnico e registros administrativos.
              </p>
            </article>
            <article>
              <h3 className="font-black text-slate-900">
                O PREVIX atende empresas de Maceió?
              </h3>
              <p className="mt-2 leading-7 text-slate-600">
                O atendimento informado é em Maceió e região, Alagoas. Entre
                em contato para conversar sobre as necessidades da sua empresa.
              </p>
            </article>
            <article>
              <h3 className="font-black text-slate-900">
                O sistema substitui um profissional de SST?
              </h3>
              <p className="mt-2 leading-7 text-slate-600">
                Não. O PREVIX apoia a organização e consulta de dados; análises,
                documentos técnicos e validações profissionais devem ser
                realizados por responsáveis habilitados quando aplicável.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-teal-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Conheça o PREVIX SST
            </h2>
            <p className="mt-2 text-slate-600">
              Tire suas dúvidas e veja como o sistema pode apoiar a organização
              das rotinas de SST da sua empresa.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 justify-center rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800"
          >
            Conversar com a PREVIX
          </a>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>PREVIX SST — Gestão de Segurança e Saúde no Trabalho em Maceió.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="font-semibold hover:text-teal-800" href="tel:+5582994145622">
            (82) 99414-5622
          </a>
          <a className="font-semibold hover:text-teal-800" href="mailto:previxsst1@gmail.com">
            previxsst1@gmail.com
          </a>
          <a className="font-semibold hover:text-teal-800" href="/">
            Acesso ao sistema
          </a>
        </div>
      </footer>
    </main>
  );
}
