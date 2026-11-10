import { useState, useMemo } from "react";

const STORAGE_KEY = "previx_extintores";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function diasPara(data) {
  if (!data) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(data + "T00:00:00");
  return Math.ceil((d - hoje) / (1000 * 60 * 60 * 24));
}

function statusExtintor(e) {
  const dias = diasPara(e.proximaRecarga || e.vencimento);
  if (dias === null) return { label: "SEM DATA", dias: 0, cor: "bg-gray-100" };
  if (dias < 0) return { label: `VENCIDO - ${Math.abs(dias)} dias`, dias, cor: "bg-red-100" };
  if (dias <= 30) return { label: `A VENCER - ${dias} dias`, dias, cor: "bg-yellow-100" };
  return { label: `EM DIA - ${dias} dias`, dias, cor: "bg-green-100" };
}

function formataData(data) {
  if (!data) return "-";
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function Extintores() {
  const [lista, setLista] = useState(load);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [mostraForm, setMostraForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    local: "",
    tipo: "PQS 6kg",
    vencimento: "",
    ultimaRecarga: "",
    proximaRecarga: "",
  });

  function salvar() {
    if (!form.local) return alert("Preencha o local");
    if (!form.proximaRecarga) return alert("Preencha a Próxima Recarga");

    let nova;
    if (editando) {
      nova = lista.map((x) => (x.id === editando ? { ...form, id: editando } : x));
    } else {
      nova = [...lista, { ...form, id: Date.now().toString() }];
    }
    setLista(nova);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nova));
    setMostraForm(false);
    setEditando(null);
    setForm({ local: "", tipo: "PQS 6kg", vencimento: "", ultimaRecarga: "", proximaRecarga: "" });
  }

  function excluir(id) {
    if (!confirm("Excluir este extintor?")) return;
    const nova = lista.filter((x) => x.id !== id);
    setLista(nova);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nova));
  }

  function editar(e) {
    setForm(e);
    setEditando(e.id);
    setMostraForm(true);
  }

  const filtrada = useMemo(() => {
    return lista.filter((e) => {
      const st = statusExtintor(e);
      if (filtro === "vencido" && st.dias >= 0) return false;
      if (filtro === "a-vencer" && !(st.dias >= 0 && st.dias <= 30)) return false;
      if (filtro === "em-dia" && st.dias <= 30) return false;
      if (busca && !e.local.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [lista, filtro, busca]);

  const totalVencido = lista.filter((e) => statusExtintor(e).dias < 0).length;
  const totalAVencer = lista.filter((e) => {
    const d = statusExtintor(e).dias;
    return d >= 0 && d <= 30;
  }).length;
  const totalEmDia = lista.filter((e) => statusExtintor(e).dias > 30).length;

  return (
    <div className="bg-white rounded-3xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black lowercase">extintores</h2>
          <p className="text-gray-400">Total: {lista.length}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-4 py-3 rounded-2xl font-bold text-sm">
            PDF Extintores
          </button>
          <button
            onClick={() => setMostraForm(true)}
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 py-3 rounded-2xl font-bold text-sm"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <button onClick={() => setFiltro("todos")} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">Todos ({lista.length})</button>
        <button onClick={() => setFiltro("vencido")} className="bg-red-100 px-3 py-1 rounded-full text-sm font-bold">🔴 Vencido ({totalVencido})</button>
        <button onClick={() => setFiltro("a-vencer")} className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-bold">🟡 A Vencer ({totalAVencer})</button>
        <button onClick={() => setFiltro("em-dia")} className="bg-green-100 px-3 py-1 rounded-full text-sm font-bold">🟢 Em Dia ({totalEmDia})</button>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar em extintores..."
        className="w-full border rounded-xl px-3 py-2 mt-4"
      />

      {mostraForm && (
        <div className="border rounded-2xl p-4 mt-4 bg-gray-50">
          <h3 className="font-bold mb-3">{editando ? "Editar Extintor" : "Novo Extintor"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Local - Ex: ADMINISTRATIVO" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} className="border rounded-xl px-3 py-2 col-span-2" />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="border rounded-xl px-3 py-2">
              <option>PQS 6kg</option>
              <option>PQS 4kg</option>
              <option>CO2 6kg</option>
              <option>AP 10L</option>
            </select>
            <input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} className="border rounded-xl px-3 py-2" />
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-gray-500">ÚLTIMA RECARGA</span>
                <input type="date" value={form.ultimaRecarga} onChange={(e) => setForm({ ...form, ultimaRecarga: e.target.value })} className="border rounded-xl px-3 py-2 w-full" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-red-600">PRÓXIMA RECARGA *</span>
                <input type="date" value={form.proximaRecarga} onChange={(e) => setForm({ ...form, proximaRecarga: e.target.value })} className="border rounded-xl px-3 py-2 w-full border-red-300" />
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Salvar</button>
            <button onClick={() => setMostraForm(false)} className="bg-gray-200 px-4 py-2 rounded-xl font-bold">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-4">
        {filtrada.map((e) => {
          const st = statusExtintor(e);
          return (
            <div key={e.id} className={`${st.cor} rounded-2xl p-3 flex justify-between items-center`}>
              <div>
                <p className="font-black uppercase">{e.local} <span className="text-xs font-bold bg-black/10 px-2 py-1 rounded-full">{st.label}</span></p>
                <p className="text-sm text-gray-500">
                  {e.local} • Tipo: {e.tipo} • Venc: {formataData(e.vencimento)} • Recarga: {formataData(e.proximaRecarga)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editar(e)} className="bg-blue-100 px-3 py-1 rounded-lg font-bold text-sm">Editar</button>
                <button onClick={() => excluir(e.id)} className="bg-red-100 px-3 py-1 rounded-lg font-bold text-sm">Excluir</button>
              </div>
            </div>
          );
        })}
        {filtrada.length === 0 && <p className="text-center text-gray-400 py-4">Nenhum extintor encontrado</p>}
      </div>
    </div>
  );
}