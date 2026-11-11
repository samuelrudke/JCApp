// Deteta automaticamente se está em localhost ou IP de rede, mantendo a porta 8000 do FastAPI
const API_BASE = `http://${window.location.hostname}:8000`;

export const api = {
  async getResumo() {
    const res = await fetch(`${API_BASE}/gestao/resumo`);
    if (!res.ok) throw new Error('Erro ao buscar resumo MEI');
    return res.json();
  },

  async getOrcamentos() {
    const res = await fetch(`${API_BASE}/orcamentos`);
    if (!res.ok) throw new Error('Erro ao buscar histórico');
    return res.json();
  },

  async salvarOrcamento(dados: {
    cliente_nome: string;
    tipo_movel: string;
    quantidade_pecas: number;
    complexidade: string;
    valor_base_hora: number;
    taxa_deslocamento: number;
  }) {
    const res = await fetch(`${API_BASE}/calculadora/rapida`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errDetail = await res.json().catch(() => ({}));
      throw new Error(errDetail.detail || 'Erro ao salvar no servidor');
    }
    return res.json();
  },

  // ADICIONE ESTA FUNÇÃO AQUI:
  async atualizarStatus(id: number, novoStatus: string) {
    const res = await fetch(`${API_BASE}/orcamentos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    });
    if (!res.ok) {
      const errDetail = await res.json().catch(() => ({}));
      throw new Error(errDetail.detail || 'Erro ao atualizar status');
    }
    return res.json();
  }
};