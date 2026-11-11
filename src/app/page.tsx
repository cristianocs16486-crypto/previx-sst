"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabaseClient";

type Profile = {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  empresa_id?: string | null;
};

type Empresa = {
  id: string;
  nome: string;
  cnpj?: string | null;
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

      onEntrar(profile as Profile);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.";
      setErro(message);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-500 p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-3xl">🛡️</div>
        <h1 className="text-center text-3xl font-black tracking-tight text-slate-900">PREVIX</h1>
        <p className="mb-6 mt-1 text-center text-sm text-slate-500">Gestão de SST simples, segura e completa</p>

        {(erroInicial || erro) && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro || erroInicial}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className="mb-1 block text-xs font-extrabold text-slate-700">E-MAIL</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="mb-4 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          />
          <label htmlFor="senha" className="mb-1 block text-xs font-extrabold text-slate-700">SENHA</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={event => setSenha(event.target.value)}
            placeholder="Sua senha"
            className="mb-5 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !supabaseConfigured}
            className="w-full rounded-xl bg-blue-700 py-3 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">Acesso restrito. Somente o administrador cria contas.</p>
        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-3 text-center text-sm text-slate-600">
          <b className="text-sky-900">Precisa de ajuda? Fale com o suporte</b>
          <p className="mt-1">WhatsApp: (82) 99999-0000</p>
          <p>suporte@previx.com.br</p>
        </div>
      </section>
    </main>
  );
}

function PainelEmpresas({ usuario, onSair }: { usuario: Profile; onSair: () => void }) {
  const ehAdm = usuario.tipo === "adm";
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [nome, setNome] = useState("");
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarEmpresas = useCallback(async () => {
    setCarregandoEmpresas(true);
    setErro("");
    let query = supabase.from("empresas").select("*").order("created_at", { ascending: false });
    if (!ehAdm) {
      if (!usuario.empresa_id) {
        setEmpresas([]);
        setEmpresaSelecionada(null);
        setErro("Esta conta não possui uma empresa vinculada. Fale com o administrador.");
        setCarregandoEmpresas(false);
        return;
      }
      query = query.eq("id", usuario.empresa_id);
    }

    const { data, error: queryError } = await query;
    if (queryError) {
      setErro(`Não foi possível carregar as empresas: ${queryError.message}`);
      setCarregandoEmpresas(false);
      return;
    }
    const lista = (data || []) as Empresa[];
    setEmpresas(lista);
    setEmpresaSelecionada(atual => lista.find(empresa => empresa.id === atual?.id) || lista[0] || null);
    setCarregandoEmpresas(false);
  }, [ehAdm, usuario.empresa_id]);

  useEffect(() => {
    void carregarEmpresas();
  }, [carregarEmpresas]);

  async function cadastrarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nomeEmpresa = nome.trim();
    if (!nomeEmpresa) return;
    setErro("");
    setMensagem("");
    setSalvando(true);
    const { data, error: insertError } = await supabase
      .from("empresas")
      .insert({ nome: nomeEmpresa })
      .select("*")
      .single();
    if (insertError) {
      setErro(`Não foi possível cadastrar a empresa: ${insertError.message}`);
    } else {
      setNome("");
      setEmpresaSelecionada(data as Empresa);
      setMensagem(`Empresa "${nomeEmpresa}" cadastrada.`);
      await carregarEmpresas();
    }
    setSalvando(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="flex w-60 shrink-0 flex-col bg-slate-900 p-5 text-white max-sm:w-16 max-sm:px-2">
        <div className="mb-8 px-2 text-xl font-black max-sm:px-0 max-sm:text-center">PREVIX</div>
        <button className="rounded-xl bg-blue-700 px-3 py-3 text-left font-bold" aria-current="page">
          <span aria-hidden="true">🏢 </span><span className="max-sm:hidden">Empresas</span>
        </button>
        <button onClick={onSair} className="mt-auto rounded-xl px-3 py-3 text-left font-bold text-red-200 hover:bg-slate-800">
          <span aria-hidden="true">↪ </span><span className="max-sm:hidden">Sair</span>
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-6 max-sm:p-4">
        <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black">PREVIX</h1>
            <p className="mt-1 text-sm text-slate-500">Olá, {usuario.nome || usuario.email}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-800">{usuario.tipo}</span>
        </header>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Empresas</h2>
              <p className="text-sm text-slate-500">Empresas cadastradas no PREVIX</p>
            </div>
            {ehAdm && <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 shadow-sm">{empresas.length}</span>}
          </div>

          {ehAdm && (
            <form onSubmit={cadastrarEmpresa} className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm">
              <input
                required
                value={nome}
                onChange={event => setNome(event.target.value)}
                placeholder="Nome da empresa"
                aria-label="Nome da empresa"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={salvando}
                className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {salvando ? "Cadastrando..." : "+ Cadastrar Empresa"}
              </button>
            </form>
          )}

          {erro && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
          {mensagem && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}

          {carregandoEmpresas ? (
            <p className="rounded-xl bg-white p-5 text-center font-bold text-slate-500">Carregando empresas...</p>
          ) : empresas.length === 0 ? (
            !erro && <p className="rounded-xl bg-white p-5 text-center text-slate-500">Nenhuma empresa cadastrada.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {empresas.map(empresa => (
                <button
                  type="button"
                  key={empresa.id}
                  onClick={() => setEmpresaSelecionada(empresa)}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 ${
                    empresaSelecionada?.id === empresa.id ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <span className="mb-3 block text-2xl" aria-hidden="true">🏢</span>
                  <span className="block font-extrabold">{empresa.nome}</span>
                  {empresa.cnpj && <span className="mt-1 block text-sm text-slate-500">CNPJ: {empresa.cnpj}</span>}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  const [usuario, setUsuario] = useState<Profile | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [erroSessao, setErroSessao] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarSessao() {
      if (!supabaseConfigured) {
        setErroSessao("Configuração ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.");
        setCarregandoSessao(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();
          if (profileError) throw new Error(`Não foi possível carregar o perfil: ${profileError.message}`);
          if (ativo && profile) setUsuario(profile as Profile);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível recuperar a sessão.";
        if (ativo) setErroSessao(message);
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    }

    void carregarSessao();
    return () => { ativo = false; };
  }, []);

  async function sair() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErroSessao(`Não foi possível sair: ${error.message}`);
      return;
    }
    setUsuario(null);
  }

  if (carregandoSessao) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 font-bold text-slate-600">Carregando PREVIX...</main>;
  }
  if (!supabaseConfigured) return <Login onEntrar={setUsuario} erroInicial={erroSessao} />;
  if (!usuario) return <Login onEntrar={setUsuario} erroInicial={erroSessao} />;
  if (usuario.tipo === "adm" || usuario.tipo === "empresa") {
    return <PainelEmpresas usuario={usuario} onSair={sair} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow">
        <h1 className="text-xl font-black">PREVIX</h1>
        <p className="mt-2 text-slate-600">Este perfil não tem acesso ao painel de empresas. Fale com o administrador.</p>
        <button onClick={sair} className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">Sair</button>
      </div>
    </main>
  );
}
