"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Dashboard from "./dashboard";
import { supabase, supabaseConfigured } from "./supabaseClient";

type Profile = {
  id: string;
  email: string;
  nome?: string | null;
  tipo: string;
  empresa_id?: string | null;
};

function Login({ onEntrar, erroInicial }: { onEntrar: (profile: Profile) => void; erroInicial: string }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw error;
      if (!data.user) throw new Error("O Supabase não retornou um usuário autenticado.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profileError) throw new Error(`Não foi possível carregar o perfil: ${profileError.message}`);
      if (!profile) throw new Error("Perfil não encontrado para este usuário.");
      if (profile.tipo === "empresa") {
        if (!profile.empresa_id) throw new Error("Esta conta não está vinculada a uma empresa.");
        const { data: company, error: companyError } = await supabase
          .from("empresas")
          .select("status")
          .eq("id", profile.empresa_id)
          .single();
        if (companyError) throw new Error(`Não foi possível validar o status da empresa: ${companyError.message}`);
        if (company.status === "Inativa") throw new Error("O acesso desta empresa está inativo. Fale com o administrador.");
      }

      onEntrar(profile as Profile);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.";
      setErro(message);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error("Erro ao encerrar sessão após falha no login:", signOutError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600 p-4">
      <section className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <Image src="/logo.png" alt="Logo PREVIX SST" width={72} height={48} priority className="mx-auto mb-2 h-12 w-[72px] object-contain" />
        <h1 className="text-center text-2xl font-black tracking-tight text-slate-900">PREVIX SST</h1>
        <p className="mb-5 mt-1 text-center text-xs text-teal-700">Prevenção que Protege</p>

        {(erroInicial || erro || !supabaseConfigured) && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro || erroInicial || "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-600">E-mail de acesso</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="E-mail"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
          <label htmlFor="senha" className="mb-1 block text-xs font-bold text-slate-600">Senha</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={event => setSenha(event.target.value)}
            placeholder="Sua senha"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !supabaseConfigured}
            className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 py-2.5 text-sm font-black text-white hover:from-teal-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-4 rounded-lg border border-cyan-100 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 p-3 text-center text-xs text-slate-600">
          <b className="text-slate-800">Suporte técnico</b>
          <p className="mt-1">Precisa de ajuda para acessar o sistema?</p>
          <a href="mailto:suporte@previx.com.br" className="mt-1 inline-block font-bold text-teal-800 underline underline-offset-2">suporte@previx.com.br</a>
        </div>
      </section>
    </main>
  );
}

export default function Page() {
  const [usuario, setUsuario] = useState<Profile | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT" && ativo) setUsuario(null);
    });

    async function carregarSessao() {
      if (!supabaseConfigured) {
        setErro("Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        setCarregando(false);
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data.session) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();
          if (profileError) throw new Error(`Não foi possível carregar o perfil: ${profileError.message}`);
          if (profile?.tipo === "empresa") {
            if (!profile.empresa_id) throw new Error("Esta conta não está vinculada a uma empresa.");
            const { data: company, error: companyError } = await supabase
              .from("empresas")
              .select("status")
              .eq("id", profile.empresa_id)
              .single();
            if (companyError) throw new Error(`Não foi possível validar o status da empresa: ${companyError.message}`);
            if (company.status === "Inativa") throw new Error("O acesso desta empresa está inativo. Fale com o administrador.");
          }
          if (ativo && profile) setUsuario(profile as Profile);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível recuperar a sessão.";
        if (ativo) {
          setErro(message);
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error("Erro ao encerrar sessão sem acesso válido:", signOutError.message);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarSessao();
    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sair() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setErro(`Não foi possível sair: ${signOutError.message}`);
      return;
    }
    setUsuario(null);
  }

  if (carregando) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 font-bold text-slate-600">Carregando PREVIX...</main>;
  }
  if (!usuario) return <Login onEntrar={setUsuario} erroInicial={erro} />;
  if (usuario.tipo === "adm" || usuario.tipo === "empresa") return <Dashboard usuario={usuario} onSair={sair} />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="max-w-md rounded-2xl bg-white p-6 text-center shadow">
        <h1 className="text-xl font-black">PREVIX SST</h1>
        <p className="mt-2 text-slate-600">Este perfil não tem acesso ao painel. Fale com o administrador.</p>
        <button onClick={sair} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Sair</button>
      </section>
    </main>
  );
}
