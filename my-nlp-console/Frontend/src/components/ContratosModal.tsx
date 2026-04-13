import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, Building, FileText, ArrowLeft, CheckCircle2, XCircle, Edit3, Save, Target } from 'lucide-react';
import { type Prospect } from './Contratos'; 

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE', 'FINANCEIRO', 'ESTOQUE'];

const API_URL = 'https://core-nlp-support.onrender.com/prospects';

interface ModalProps {
  prospect: Prospect;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string; 
}

export default function ProspectModal({ prospect, onClose, currentUserId, currentUserName }: ModalProps) {
  // Ajuste: Dependendo de como o backend salva "Possibilidade", você pode precisar adicionar 'POSSIBILIDADE' aqui
  const isFinished = prospect.status === 'APROVADO' || prospect.status === 'REPROVADO' || prospect.status === 'POSSIBILIDADE';
  
  const [isEditing, setIsEditing] = useState(!isFinished);

  const inicializarModulos = () => {
    if (!prospect.novosModulos) return [];
    if (Array.isArray(prospect.novosModulos)) return prospect.novosModulos;
    if (typeof prospect.novosModulos === 'string') {
      return prospect.novosModulos.split(',').map(m => m.trim()).filter(m => m !== '');
    }
    return [];
  };

  const [observacoes, setObservacoes] = useState(prospect.observacoes || '');
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>(inicializarModulos());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setObservacoes(prospect.observacoes || '');
    setModulosSelecionados(inicializarModulos());
  }, [prospect]);

  const handleCheck = (modulo: string) => {
    if (!isEditing) return; // Só permite checar se estiver editando
    setModulosSelecionados(prev => 
      prev.includes(modulo) 
        ? prev.filter(m => m !== modulo) 
        : [...prev, modulo]
    );
  };

  // Atualizado para aceitar 'POSSIBILIDADE'
  const handleSubmit = async (acao: 'APROVADO' | 'REPROVADO' | 'PENDENTE' | 'POSSIBILIDADE') => {
    setIsSaving(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      const endpoint = acao === 'PENDENTE' ? 'finish' : 'finish'; 
      
      await axios.post(`${API_URL}/${prospect.id}/${endpoint}`, 
        {
          userId: currentUserId,
          atendidoPor: currentUserName,
          observacoes,
          novosModulos: modulosSelecionados, 
          acao: acao
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      onClose(); 
      
    } catch (error: any) {
      console.error('Erro ao salvar atendimento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      await axios.patch(`${API_URL}/${prospect.id}/update`, 
        {
          observacoes,
          novosModulos: modulosSelecionados, 
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setIsEditing(false); 
    } catch (error: any) {
      console.error('Erro ao atualizar informações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (isFinished && !isEditing) {
        onClose();
      } else if (!isFinished) {
        handleSubmit('PENDENTE'); 
      } else {
        if(window.confirm('Existem alterações não salvas. Deseja sair mesmo assim?')) onClose();
      }
    }
  };

  const getBadgeColor = (status?: string) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    const text = status.toLowerCase();
    if (text.includes('ativa')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (text.includes('baixa') || text.includes('inapta')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const renderStatusBadge = () => {
    if (prospect.status === 'APROVADO') {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-emerald-200">
          Interessado
        </span>
      );
    }
    if (prospect.status === 'REPROVADO') {
      return (
        <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-rose-200">
          Não Interessado
        </span>
      );
    }
    // Adicionado badge de Possibilidade
    if (prospect.status === 'POSSIBILIDADE') {
      return (
        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-blue-200">
          Possibilidade
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse border border-amber-200">
        Em Atendimento
      </span>
    );
  };

  // Formatação de Data
  const formatarData = (dataStr?: string) => {
    if (!dataStr) return '';
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans" onClick={handleOutsideClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-900/5">
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {prospect.nome}
              </h2>
              {renderStatusBadge()}
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
        
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
              <FileText size={14} /> Registro de Atendimento {isFinished && !isEditing && '(Modo Leitura)'}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                {!isEditing ? 'Módulos que o cliente demonstrou interesse:' : 'Quais módulos o cliente demonstrou interesse?'}
              </label>
              <div className="flex flex-wrap gap-2">
                {MODULOS_DISPONIVEIS.map(modulo => {
                  const isChecked = modulosSelecionados.includes(modulo);
                  return (
                    <label 
                      key={modulo} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        isChecked 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600'
                      } ${isEditing ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50' : 'cursor-default opacity-90'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={isChecked}
                        onChange={() => handleCheck(modulo)}
                        disabled={!isEditing}
                      />
                      {modulo}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Observações da Ligação / Reunião
              </label>
              <textarea 
                className={`w-full border rounded-xl p-4 text-sm text-slate-700 focus:outline-none transition-all resize-none shadow-sm ${
                  !isEditing 
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed' 
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400'
                }`}
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva aqui os principais pontos conversados com o cliente..."
                disabled={isSaving || !isEditing}
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-200 bg-white shrink-0">
          
          {isFinished ? (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-600">
                {prospect.atendidoPor ? (
                  <>Atendido por <span className="font-bold text-slate-800">{prospect.atendidoPor}</span> em {formatarData(prospect.dataAtendimento as string)}</>
                ) : (
                  <span className="italic text-slate-400">Dados de atendimento antigos não possuem registro de autor</span>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all border border-blue-200"
                    >
                      <Edit3 size={18} />
                      Editar Informações
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex justify-center items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Fechar
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="flex justify-center items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
                    >
                      <Save size={18} />
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handleSubmit('PENDENTE')}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={18} />
                Desistir / Voltar
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSubmit('REPROVADO')}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 shadow-sm"
                >
                  <XCircle size={18} />
                  Não interessado
                </button>
                
                {/* NOVO BOTÃO DE POSSIBILIDADE AQUI */}
                <button 
                  onClick={() => handleSubmit('POSSIBILIDADE')}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Target size={18} />
                  {isSaving ? 'Salvando...' : 'Possibilidade'}
                </button>

                <button 
                  onClick={() => handleSubmit('APROVADO')}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle2 size={18} />
                  {isSaving ? 'Salvando...' : 'Interessado'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}