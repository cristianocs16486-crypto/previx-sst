<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PREVIX - Norte Vidros</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  *{font-family:Inter,system-ui,sans-serif}
  body{background:#EAFcff}
  input,select,textarea{border:1px solid #D1D5DB;border-radius:10px;padding:10px 12px;width:100%;outline:none;background:white}
  input:focus{border-color:#0E7490}
  .tab{white-space:nowrap;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;color:white;background:rgba(255,255,255,.15)}
  .tab.active{background:white;color:#0F766E}
  .btn-add{background:linear-gradient(135deg,#0D9488,#2563EB);color:white;padding:14px 18px;border-radius:14px;font-weight:700;font-size:14px}
  .hidden{display:none!important}
</style>
</head>
<body>

<!-- ============ LOGIN - LOGO VERMELHA CORRIGIDA ============ -->
<div id="loginScreen" class="min-h-screen flex items-center justify-center p-4 bg-[#EAFcff]">
  <div class="bg-white w-full max-w-md rounded-[24px] shadow-xl p-8">
    <div class="text-center">
      <div class="w-[72px] h-[72px] mx-auto bg-red-600 rounded-[18px] flex items-center justify-center shadow-lg"><span class="text-white text-[32px] font-black">P</span></div>
      <h1 class="text-[44px] leading-none font-black tracking-tight mt-4"><span class="text-red-600">PRE</span><span class="text-slate-900">VIX</span></h1>
      <p class="text-slate-500 text-sm mt-1">Gestão Completa de SST • PGR • PCMSO • eSocial</p>
      <div class="inline-flex bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full mt-3">Empresa Ativa: Norte Vidros • Parceiro: Bio Proteção</div>
    </div>
    <label class="text-sm font-bold mt-6 block">E-mail</label>
    <input id="loginEmail" value="admin@nortevidros.com.br" class="mt-1">
    <label class="text-sm font-bold mt-3 block">Senha</label>
    <input id="loginPass" type="password" value="123456" class="mt-1">
    <button onclick="doLogin()" class="w-full py-3.5 rounded-xl font-bold mt-5 text-white" style="background:#DC2626">Entrar no Painel →</button>
    <p class="text-center text-xs text-slate-400 mt-3">Demo: admin@nortevidros.com.br / 123456</p>
  </div>
</div>

<!-- ============ APP ============ -->
<div id="appScreen" class="hidden min-h-screen">
  <!-- BARRA SUPERIOR IGUAL DA FOTO -->
  <header class="sticky top-0 z-40" style="background:linear-gradient(90deg,#0D9488,#2563EB)">
    <div class="flex gap-2 overflow-x-auto p-2 px-3" id="topTabs">
      <button onclick="showPage('inicio')" data-tab="inicio" class="tab active">🏠 Início</button>
      <button onclick="showPage('funcionarios')" data-tab="funcionarios" class="tab">👷 Funcionários</button>
      <button onclick="showPage('epis')" data-tab="epis" class="tab">🎒 EPI's</button>
      <button onclick="showPage('extintores')" data-tab="extintores" class="tab">🧯 Extintores</button>
      <button onclick="showPage('inspecoes')" data-tab="inspecoes" class="tab">📋 Inspeções</button>
      <button onclick="showPage('documentos')" data-tab="documentos" class="tab">📄 Documentos</button>
      <button onclick="showPage('exames')" data-tab="exames" class="tab">🩺 Exames</button>
      <button onclick="showPage('clinicas')" data-tab="clinicas" class="tab">🏥 Clínicas</button>
      <button onclick="showPage('pgr')" data-tab="pgr" class="tab">⚠️ PGR / Riscos</button>
      <button onclick="showPage('financeiro')" data-tab="financeiro" class="tab">💰 Financeiro</button>
    </div>
  </header>

  <main class="p-3 md:p-6 max-w-[1100px] mx-auto">

    <!-- INICIO -->
    <div id="page-inicio">
      <div class="bg-white rounded-[20px] p-6 shadow-sm">
        <h1 class="text-2xl font-black">Olá, Norte Vidros 👋</h1>
        <p class="text-slate-500 text-sm">Painel geral • Parceiro: Bio Proteção</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div class="border rounded-2xl p-4"><p class="text-xs text-slate-500">Funcionários</p><p id="cFunc" class="text-2xl font-black">0</p></div>
          <div class="border rounded-2xl p-4"><p class="text-xs text-slate-500">Extintores</p><p id="cExt" class="text-2xl font-black text-red-600">0</p></div>
          <div class="border rounded-2xl p-4"><p class="text-xs text-slate-500">EPI's</p><p id="cEpi" class="text-2xl font-black">0</p></div>
          <div class="border rounded-2xl p-4"><p class="text-xs text-slate-500">Exames</p><p id="cExame" class="text-2xl font-black">0</p></div>
        </div>
        <button onclick="showPage('extintores')" class="mt-5 px-4 py-2 rounded-lg text-white font-bold text-sm" style="background:#DC2626">Ir para Extintores →</button>
      </div>
    </div>

    <!-- EXTINTORES - IGUAL DA FOTO, CORRIGIDO -->
    <div id="page-extintores" class="hidden">
      <div class="bg-white rounded-[20px] p-5 md:p-6 shadow-sm">
        <div class="flex justify-between items-start">
          <div><h2 class="text-[22px] font-black">Extintores</h2><p class="text-sm text-slate-500 mt-1">Total: <span id="totalExt">0</span></p></div>
          <button onclick="openModal('modalExt')" class="btn-add">+ Adicionar</button>
        </div>
        <input id="searchExt" oninput="renderAll()" placeholder="Buscar em extintores..." class="mt-4">
        <div id="listExt" class="mt-4"></div>
      </div>
    </div>

    <!-- FUNCIONARIOS -->
    <div id="page-funcionarios" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Funcionários</h2><p class="text-sm text-slate-500">Total: <span id="totalFunc">0</span></p></div><button onclick="openModal('modalFunc')" class="btn-add">+ Adicionar</button></div><input id="searchFunc" oninput="renderAll()" placeholder="Buscar em funcionários..." class="mt-4"><div id="listFunc" class="mt-4"></div></div></div>

    <!-- EPIS -->
    <div id="page-epis" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">EPI's</h2><p class="text-sm text-slate-500">Total: <span id="totalEpi">0</span></p></div><button onclick="openModal('modalEpi')" class="btn-add">+ Adicionar</button></div><div id="listEpi" class="mt-4"></div></div></div>

    <!-- INSPECOES -->
    <div id="page-inspecoes" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Inspeções</h2><p class="text-sm text-slate-500">Total: <span id="totalInsp">0</span></p></div><button onclick="openModal('modalInsp')" class="btn-add">+ Adicionar</button></div><div id="listInsp" class="mt-4"></div></div></div>

    <!-- DOCUMENTOS -->
    <div id="page-documentos" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Documentos</h2><p class="text-sm text-slate-500">PGR / PCMSO / LTCAT - Norte Vidros</p></div><button onclick="openModal('modalDoc')" class="btn-add">+ Adicionar</button></div><div id="listDoc" class="mt-4"></div></div></div>

    <!-- EXAMES -->
    <div id="page-exames" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Exames</h2><p class="text-sm text-slate-500">Total: <span id="totalExame">0</span></p></div><button onclick="openModal('modalExame')" class="btn-add">+ Adicionar</button></div><div id="listExame" class="mt-4"></div></div></div>

    <!-- CLINICAS -->
    <div id="page-clinicas" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Clínicas</h2><p class="text-sm text-slate-500">Parceiras</p></div><button onclick="openModal('modalClinica')" class="btn-add">+ Adicionar</button></div><div id="listClinica" class="mt-4"></div></div></div>

    <!-- PGR -->
    <div id="page-pgr" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">PGR / Riscos</h2><p class="text-sm text-slate-500">Total: <span id="totalPgr">0</span></p></div><button onclick="openModal('modalPgr')" class="btn-add">+ Adicionar</button></div><div id="listPgr" class="mt-4"></div></div></div>

    <!-- FINANCEIRO -->
    <div id="page-financeiro" class="hidden"><div class="bg-white rounded-[20px] p-6"><div class="flex justify-between"><div><h2 class="text-[22px] font-black">Financeiro</h2><p class="text-sm text-slate-500">Total: <span id="totalFin">0</span></p></div><button onclick="openModal('modalFin')" class="btn-add">+ Adicionar</button></div><div id="listFin" class="mt-4"></div></div></div>

  </main>
</div>

<!-- MODAIS -->
<div id="modalExt" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Extintor</h3>
  <input id="eLocal" placeholder="Local - ex: Oficina, Loja, Estoque" class="mt-4">
  <select id="eTipo" class="mt-2"><option>PQS 6kg</option><option>CO2 6kg</option><option>Água 10L</option><option>PQS 4kg</option></select>
  <input id="eValidade" type="date" class="mt-2"><input id="eCodigo" placeholder="Código / Nº" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveExtintor()" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar Extintor</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalFunc" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Funcionário</h3><input id="fNome" placeholder="Nome completo" class="mt-4"><input id="fCargo" placeholder="Cargo - ex: Vidraceiro" class="mt-2"><input id="fCpf" placeholder="CPF" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveFunc()" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalEpi" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo EPI</h3><input id="epiFunc" placeholder="Funcionário" class="mt-4"><input id="epiItem" placeholder="EPI - ex: Óculos, Luva" class="mt-2"><input id="epiData" type="date" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_epis',{func:document.getElementById('epiFunc').value,item:document.getElementById('epiItem').value,data:document.getElementById('epiData').value},'epiFunc','epis','EPI salvo!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalInsp" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Nova Inspeção</h3><input id="iLocal" placeholder="Local inspecionado" class="mt-4"><input id="iData" type="date" class="mt-2"><input id="iObs" placeholder="Observação" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_inspecoes',{local:document.getElementById('iLocal').value,data:document.getElementById('iData').value,obs:document.getElementById('iObs').value},'iLocal','inspecoes','Inspeção salva!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalDoc" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Documento</h3><select id="dTipo" class="mt-4"><option>PGR</option><option>PCMSO</option><option>LTCAT</option><option>PPP</option></select><input id="dVal" type="date" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_docs',{tipo:document.getElementById('dTipo').value,data:document.getElementById('dVal').value},'dTipo','documentos','Documento salvo!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalExame" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Exame</h3><input id="exFunc" placeholder="Funcionário" class="mt-4"><select id="exTipo" class="mt-2"><option>Admissional</option><option>Periódico</option><option>Demissional</option></select><input id="exData" type="date" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_exames',{func:document.getElementById('exFunc').value,tipo:document.getElementById('exTipo').value,data:document.getElementById('exData').value},'exFunc','exames','Exame salvo!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalClinica" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Nova Clínica</h3><input id="cNome" placeholder="Nome da clínica - ex: Bio Proteção" class="mt-4"><input id="cCidade" placeholder="Cidade" class="mt-2">
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_clinicas',{nome:document.getElementById('cNome').value,cidade:document.getElementById('cCidade').value},'cNome','clinicas','Clínica salva!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalPgr" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Risco - PGR</h3><input id="pSetor" placeholder="Setor - ex: Corte de Vidro" class="mt-4"><input id="pRisco" placeholder="Risco - ex: Corte, Ruído" class="mt-2"><select id="pNivel" class="mt-2"><option>Baixo</option><option>Médio</option><option>Alto</option></select>
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_pgr',{setor:document.getElementById('pSetor').value,risco:document.getElementById('pRisco').value,nivel:document.getElementById('pNivel').value},'pSetor','pgr','Risco salvo!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<div id="modalFin" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div class="bg-white w-full max-w-md rounded-2xl p-6">
  <h3 class="font-black text-lg">Novo Lançamento</h3><input id="finDesc" placeholder="Descrição" class="mt-4"><input id="finValor" type="number" placeholder="Valor R$" class="mt-2"><select id="finTipo" class="mt-2"><option>Receita</option><option>Despesa</option></select>
  <div class="flex gap-2 mt-4"><button onclick="saveGeneric('previx_fin',{desc:document.getElementById('finDesc').value,valor:document.getElementById('finValor').value,tipo:document.getElementById('finTipo').value},'finDesc','financeiro','Lançamento salvo!')" class="flex-1 py-3 rounded-xl font-bold text-white" style="background:#DC2626">Salvar</button><button onclick="closeModals()" class="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
</div></div>

<script>
// ===== BANCO ÚNICO - CORREÇÃO PRINCIPAL =====
function getData(k){ try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return []} }
function setData(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

function doLogin(){ document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('appScreen').classList.remove('hidden'); renderAll(); }
function showPage(p){ document.querySelectorAll('[id^="page-"]').forEach(e=>e.classList.add('hidden')); document.getElementById('page-'+p).classList.remove('hidden'); document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); document.querySelectorAll('[data-tab="'+p+'"]').forEach(t=>t.classList.add('active')); }
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModals(){ document.querySelectorAll('[id^="modal"]').forEach(m=>m.classList.add('hidden')); }
function delItem(key,idx){ let a=getData(key); a.splice(idx,1); setData(key,a); renderAll(); }

// SALVAR GENERICO - FUNCIONA PRA TODOS
function saveGeneric(key, obj, requiredFieldId, pageToShow, msg){
  let req = document.getElementById(requiredFieldId)?.value?.trim();
  if(requiredFieldId && !req && !obj.tipo){ alert('Preencha o campo principal'); return; }
  let arr=getData(key); arr.push(obj); setData(key,arr);
  closeModals(); renderAll(); showPage(pageToShow); alert(msg);
}
function saveFunc(){
  let nome=document.getElementById('fNome').value.trim(); if(!nome){alert('Preencha o nome');return;}
  let arr=getData('previx_func'); arr.push({nome, cargo:document.getElementById('fCargo').value, cpf:document.getElementById('fCpf').value}); setData('previx_func',arr);
  document.getElementById('fNome').value=''; closeModals(); renderAll(); showPage('funcionarios'); alert('Funcionário salvo!');
}
// EXTINTOR - AGORA SALVA NA CHAVE CERTA
function saveExtintor(){
  let local=document.getElementById('eLocal').value.trim(); if(!local){alert('Preencha o local');return;}
  let arr=getData('previx_extintores'); arr.push({local, tipo:document.getElementById('eTipo').value, validade:document.getElementById('eValidade').value, codigo:document.getElementById('eCodigo').value}); setData('previx_extintores',arr);
  document.getElementById('eLocal').value=''; closeModals(); renderAll(); showPage('extintores'); alert('Extintor salvo com sucesso!');
}

function emptyMsg(){ return `<div class="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro aqui ainda. Clica em + Adicionar.</div>`; }

function renderAll(){
  let func=getData('previx_func'), ext=getData('previx_extintores'), epi=getData('previx_epis'), insp=getData('previx_inspecoes'), doc=getData('previx_docs'), exame=getData('previx_exames'), clin=getData('previx_clinicas'), pgr=getData('previx_pgr'), fin=getData('previx_fin');

  // Contadores
  document.getElementById('cFunc').innerText=func.length; document.getElementById('cExt').innerText=ext.length; document.getElementById('cEpi').innerText=epi.length; document.getElementById('cExame').innerText=exame.length;
  document.getElementById('totalExt').innerText=ext.length; document.getElementById('totalFunc').innerText=func.length; document.getElementById('totalEpi').innerText=epi.length; document.getElementById('totalInsp').innerText=insp.length; document.getElementById('totalExame').innerText=exame.length; document.getElementById('totalPgr').innerText=pgr.length; document.getElementById('totalFin').innerText=fin.length;

  let searchExt=(document.getElementById('searchExt')?.value||'').toLowerCase();
  let filteredExt=ext.filter(e=>(e.local+' '+e.tipo).toLowerCase().includes(searchExt));
  document.getElementById('listExt').innerHTML = filteredExt.length? filteredExt.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between items-center"><div><p class="font-bold">🧯 ${e.tipo} - ${e.local}</p><p class="text-xs text-slate-500">Código: ${e.codigo||'-'} • Venc: ${e.validade||'-'}</p></div><button onclick="delItem('previx_extintores',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();

  document.getElementById('listFunc').innerHTML = func.length? func.map((f,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${f.nome}</p><p class="text-xs text-slate-500">${f.cargo||''} • ${f.cpf||''}</p></div><button onclick="delItem('previx_func',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
  document.getElementById('listEpi').innerHTML = epi.length? epi.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${e.item} - ${e.func}</p><p class="text-xs text-slate-500">${e.data||''}</p></div><button onclick="delItem('previx_epis',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
  document.getElementById('listInsp').innerHTML = insp.length? insp.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${e.local}</p><p class="text-xs text-slate-500">${e.data||''} • ${e.obs||''}</p></div><button onclick="delItem('previx_inspecoes',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
  document.getElementById('listDoc').innerHTML = doc.length? doc.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">📄 ${e.tipo} - Norte Vidros</p><p class="text-xs text-slate-500">Venc: ${e.data||''}</p></div><button onclick="delItem('previx_docs',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : `<div class="border rounded-2xl p-4"><p class="font-bold">📄 PGR - Norte Vidros</p><p class="text-xs text-slate-500">Válido até 10/11/2027 • Bio Proteção</p></div>` + emptyMsg();
  document.getElementById('listExame').innerHTML = exame.length? exame.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${e.tipo} - ${e.func}</p><p class="text-xs text-slate-500">${e.data||''} • Bio Proteção</p></div><button onclick="delItem('previx_exames',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
  document.getElementById('listClinica').innerHTML = clin.length? clin.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">🏥 ${e.nome}</p><p class="text-xs text-slate-500">${e.cidade||''}</p></div><button onclick="delItem('previx_clinicas',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : `<div class="border rounded-2xl p-4"><p class="font-bold">🏥 Bio Proteção - Maceió</p><p class="text-xs text-slate-500">Clínica parceira oficial</p></div>`;
  document.getElementById('listPgr').innerHTML = pgr.length? pgr.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${e.setor} - ${e.risco}</p><p class="text-xs text-slate-500">Nível: ${e.nivel}</p></div><button onclick="delItem('previx_pgr',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
  document.getElementById('listFin').innerHTML = fin.length? fin.map((e,i)=>`<div class="border rounded-2xl p-4 flex justify-between"><div><p class="font-bold">${e.desc}</p><p class="text-xs text-slate-500">${e.tipo} • R$ ${e.valor}</p></div><button onclick="delItem('previx_fin',${i})" class="text-red-500 text-sm font-bold">Excluir</button></div>`).join('') : emptyMsg();
}
</script>
</body>
</html>