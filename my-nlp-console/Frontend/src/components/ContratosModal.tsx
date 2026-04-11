import React, { useState } from 'react';
import { Phone, Mail, Building, FileText, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { type Prospect } from './Contratos';

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE', 'FINANCEIRO', 'ESTOQUE'];
const API_URL = 'http://localhost:3000/prospects';

interface ModalProps {
  prospect: Prospect;
  onClose: () => void;
  currentUserId: string;
}

export default function ProspectModal({ prospect, onClose, currentUserId }: ModalProps) {
  const [observacoes, setObservacoes] = useState('');
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const handleCheck = (modulo: string) => {
    setModulosSelecionados(prev => 
      prev.includes(modulo) 
        ? prev.filter(m => m !== modulo) 
        : [...prev, modulo]
    );
  };

  const handleSubmit = async (acao: 'APROVADO' | 'REPROVADO' | 'PENDENTE') => {
    setIsSaving(true);
    try {
      const endpoint = acao === 'PENDENTE' ? 'finish' : 'finish'; 
      
      const response = await fetch(`${API_URL}/${prospect.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          observacoes,
          novosModulos: modulosSelecionados,
          acao: acao
        })
      });

      if (response.ok) {
        if (acao !== 'PENDENTE') alert(`Atendimento ${acao.toLowerCase()} com sucesso!`);
        onClose(); 
      } else {
        alert('Erro ao processar atendimento. Tente novamente.');
        setIsSaving(false);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão com o servidor.');
      setIsSaving(false);
    }
  };

  // 👇 Agora a função está no lugar certo, fora do handleSubmit!
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleSubmit('PENDENTE'); 
    }
  };

  // Helper para cor da situação cadastral
  const getBadgeColor = (status?: string) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    const text = status.toLowerCase();
    if (text.includes('ativa')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (text.includes('baixa') || text.includes('inapta')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans" onClick={handleOutsideClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-900/5">
        
        {/* ================= HEADER ================= */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {prospect.nome}
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse border border-amber-200">
                Em Atendimento
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {prospect.cnpj}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBadgeColor(prospect.situacaoCadastral)}`}>
                {prospect.situacaoCadastral || 'Status Desconhecido'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Painel Superior: Dados em 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Coluna Esquerda: Dados Cadastrais */}
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Building size={14} /> Detalhes da Empresa
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Atividade Principal</span>
                  <p className="text-sm text-slate-900 font-semibold leading-snug">
                    {prospect.atividadePrincipal || 'Não informada'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Simples Nacional</span>
                    <p className="text-sm text-slate-900 font-semibold">{prospect.simplesNacional || 'Não'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Módulos Atuais</span>
                    <p className="text-sm text-slate-900 font-semibold">{prospect.modulosAtuais}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Contatos */}
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} /> Contatos
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Principal</span>
                    <p className="text-sm font-semibold text-slate-900">{prospect.telefone}</p>
                  </div>
                </div>

                {prospect.telefoneSecundario && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secundário</span>
                      <p className="text-sm font-semibold text-slate-900">{prospect.telefoneSecundario}</p>
                    </div>
                  </div>
                )}

                {prospect.email && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail</span>
                      <p className="text-sm font-semibold text-slate-900 truncate">{prospect.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel Inferior: Ações de Fechamento */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
              <FileText size={14} /> Registro de Atendimento
            </h3>

            {/* Checkboxes de Módulos */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Quais módulos o cliente demonstrou interesse?
              </label>
              <div className="flex flex-wrap gap-2">
                {MODULOS_DISPONIVEIS.map(modulo => {
                  const isChecked = modulosSelecionados.includes(modulo);
                  return (
                    <label 
                      key={modulo} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={isChecked}
                        onChange={() => handleCheck(modulo)}
                      />
                      {modulo}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Observações da Ligação / Reunião
              </label>
              <textarea 
                className="w-full border border-slate-300 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none shadow-sm"
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva aqui os principais pontos conversados com o cliente..."
                disabled={isSaving}
              />
            </div>
          </div>

        </div>

        {/* ================= FOOTER (AÇÕES) ================= */}
        <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          
          <button 
            onClick={() => handleSubmit('PENDENTE')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Desistir / Voltar para a Fila
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleSubmit('REPROVADO')}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 shadow-sm"
            >
              <XCircle size={18} />
              Reprovar Lead
            </button>
            <button 
              onClick={() => handleSubmit('APROVADO')}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-600/20"
            >
              <CheckCircle2 size={18} />
              {isSaving ? 'Salvando...' : 'Aprovar Venda'}
            </button>
          </div>

        </div>
        
      </div>
    </div>
  );
}