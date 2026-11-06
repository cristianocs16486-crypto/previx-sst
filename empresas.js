// api/empresas.js - Empresas Clientes
let empresas = global._empresas || (global._empresas = []);

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(empresas);
  }

  if (req.method === 'POST') {
    const { nome, cnpj, email, senha } = req.body || {};
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }
    if (empresas.find(e => e.email === email)) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    const nova = { id: Date.now().toString(), nome, cnpj: cnpj || '', email, senha };
    empresas.push(nova);
    return res.status(201).json(nova);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    empresas = empresas.filter(e => e.id !== id);
    global._empresas = empresas;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
