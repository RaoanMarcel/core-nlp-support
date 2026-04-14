import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, Building, FileText, ArrowLeft, CheckCircle2, XCircle, Edit3, Save, Target, History, Clock, User, MapPin } from 'lucide-react';
import { type Prospect } from './Contratos'; 

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE', 'FINANCEIRO', 'ESTOQUE'];

const API_URL = 'https://core-nlp-support.onrender.com/prospects';

interface Historico {
  id: string;
  acao: string;
  observacoes: string | null;
  novosModulos: string[];
  usuario: string;
  createdAt: string;
}

interface ModalProps {
  prospect: Prospect;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string; 
}

export default function ProspectModal({ prospect, onClose, currentUserId, currentUserName }: ModalProps) {
  const isFinished = prospect.status === 'APROVADO' || prospect.status === 'REPROVADO' || prospect.status === 'POSSIBILIDADE' || prospect.status === 'RETORNAR';
  
  const [isEditing, setIsEditing] = useState(!isFinished);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const inicializarModulos = () => {
    if (!prospect.novosModulos) return [];
    if (Array.isArray(prospect.novosModulos)) return prospect.novosModulos;
    if (typeof prospect.novosModulos === 'string') {
      return (prospect.novosModulos as string).split(',').map(m => m.trim()).filter(m => m !== '');
    }
    return [];
  };

  const [observacoes, setObservacoes] = useState('');
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>(inicializarModulos());
  const [isSaving, setIsSaving] = useState(false);

  // --- NOVOS ESTADOS PARA INLINE EDITING DE CONTATOS ---
  const [isEditingContatos, setIsEditingContatos] = useState(false);
  const [isSavingContatos, setIsSavingContatos] = useState(false);
  
  const [telefoneEdit, setTelefoneEdit] = useState(prospect.telefone || '');
  const [telefoneSecEdit, setTelefoneSecEdit] = useState(prospect.telefoneSecundario || '');
  const [emailEdit, setEmailEdit] = useState(prospect.email || '');

  const carregarHistorico = async () => {
    try {
      setLoadingHistorico(true);
      const token = localStorage.getItem('@CRM:token');
      const response = await axios.get(`${API_URL}/${prospect.id}/historico`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistorico(response.data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  useEffect(() => {
    setModulosSelecionados(inicializarModulos());
    // Sincroniza os contatos com as props atuais
    setTelefoneEdit(prospect.telefone || '');
    setTelefoneSecEdit(prospect.telefoneSecundario || '');
    setEmailEdit(prospect.email || '');
    carregarHistorico();
  }, [prospect]);

  const handleCheck = (modulo: string) => {
    if (!isEditing) return; 
    setModulosSelecionados(prev => 
      prev.includes(modulo) 
        ? prev.filter(m => m !== modulo) 
        : [...prev, modulo]
    );
  };

  // --- FUNÇÕES DE INLINE EDITING DE CONTATOS ---
  const handleSalvarContatos = async () => {
    setIsSavingContatos(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      await axios.patch(`${API_URL}/${prospect.id}/update`, 
        {
          telefone: telefoneEdit,
          telefoneSecundario: telefoneSecEdit,
          email: emailEdit,
          observacoes: "Atualizou os dados de contato.", // Registro automático no histórico
          usuarioLogado: currentUserName 
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Encerra a edição e atualiza a timeline
      setIsEditingContatos(false);
      await carregarHistorico();

    } catch (error: any) {
      console.error('Erro ao atualizar contatos:', error);
    } finally {
      setIsSavingContatos(false);
    }
  };

  const handleCancelarEdicaoContatos = () => {
    // Reseta para os valores originais da prop
    setTelefoneEdit(prospect.telefone || '');
    setTelefoneSecEdit(prospect.telefoneSecundario || '');
    setEmailEdit(prospect.email || '');
    setIsEditingContatos(false);
  };

  // Função: Atualização Rápida de Status (1-Click)
  const handleQuickUpdate = async (novoStatus: 'APROVADO' | 'REPROVADO' | 'POSSIBILIDADE') => {
    setIsSaving(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      await axios.patch(`${API_URL}/${prospect.id}/update`, 
        {
          observacoes: observacoes.trim() || `Alterou o status rapidamente para: ${novoStatus}`,
          novosModulos: modulosSelecionados,
          status: novoStatus,
          usuarioLogado: currentUserName 
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setObservacoes(''); 
      setIsEditing(false); // Encerra a edição
      await carregarHistorico(); // Atualiza a timeline

    } catch (error: any) {
      console.error('Erro na atualização rápida:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (acao: 'APROVADO' | 'REPROVADO' | 'PENDENTE' | 'POSSIBILIDADE' | 'RETORNAR') => {
    setIsSaving(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      const endpoint = 'finish'; 
      
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
    if (!observacoes.trim() && modulosSelecionados.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('@CRM:token');

    try {
      await axios.patch(`${API_URL}/${prospect.id}/update`, 
        {
          observacoes,
          novosModulos: modulosSelecionados,
          usuarioLogado: currentUserName 
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setObservacoes(''); 
      await carregarHistorico(); 

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
    if (prospect.status === 'APROVADO') return <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-emerald-200">Interessado</span>;
    if (prospect.status === 'REPROVADO') return <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-rose-200">Não Interessado</span>;
    if (prospect.status === 'POSSIBILIDADE') return <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-blue-200">Possibilidade</span>;
    if (prospect.status === 'RETORNAR') return <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-purple-200">Retornar</span>;
    return <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse border border-amber-200">Em Atendimento</span>;
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return '';
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans" onClick={handleOutsideClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {prospect.nome}
              </h2>
              {renderStatusBadge()}
            </div>
            
            {prospect.nomeFantasia && (
              <p className="text-base font-semibold text-slate-500 mb-2">
                {prospect.nomeFantasia}
              </p>
            )}

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
        
        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Card Detalhes e Contatos */}
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

                {/* === ADIÇÃO: ENDEREÇO === */}
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Endereço</span>
                  <p className="text-sm text-slate-900 font-semibold leading-snug">
                    {prospect.endereco || 'Endereço não cadastrado'}
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
            
            {/* Card de Contatos com Inline Editing */}
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative transition-all">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Contatos
                </h3>
                
                {/* Botão de Editar (some quando ativo) */}
                {!isEditingContatos && (
                  <button
                    onClick={() => setIsEditingContatos(true)}
                    className="text-[10px] flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-bold uppercase tracking-wider"
                  >
                    <Edit3 size={12} /> Editar
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Telefone Principal */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Principal</span>
                    {isEditingContatos ? (
                      <input
                        type="text"
                        value={telefoneEdit}
                        onChange={(e) => setTelefoneEdit(e.target.value)}
                        placeholder="Telefone principal..."
                        className="w-full mt-0.5 text-sm font-semibold text-slate-900 bg-blue-50/60 border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 focus:bg-blue-50 px-2 py-1 rounded-t transition-all"
                        disabled={isSavingContatos}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 truncate">{telefoneEdit || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                {/* Telefone Secundário */}
                {(prospect.telefoneSecundario || isEditingContatos) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secundário</span>
                      {isEditingContatos ? (
                        <input
                          type="text"
                          value={telefoneSecEdit}
                          onChange={(e) => setTelefoneSecEdit(e.target.value)}
                          placeholder="Telefone secundário (opcional)..."
                          className="w-full mt-0.5 text-sm font-semibold text-slate-900 bg-blue-50/60 border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 focus:bg-blue-50 px-2 py-1 rounded-t transition-all"
                          disabled={isSavingContatos}
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 truncate">{telefoneSecEdit || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* E-mail */}
                {(prospect.email || isEditingContatos) && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail</span>
                      {isEditingContatos ? (
                        <input
                          type="email"
                          value={emailEdit}
                          onChange={(e) => setEmailEdit(e.target.value)}
                          placeholder="Endereço de e-mail..."
                          className="w-full mt-0.5 text-sm font-semibold text-slate-900 bg-indigo-50/60 border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-600 focus:bg-indigo-50 px-2 py-1 rounded-t transition-all"
                          disabled={isSavingContatos}
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 truncate">{emailEdit || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações (Cancelar e Salvar) - Exibidas apenas em modo de edição */}
              {isEditingContatos && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={handleCancelarEdicaoContatos}
                    disabled={isSavingContatos}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarContatos}
                    disabled={isSavingContatos}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    {isSavingContatos ? 'Salvando...' : 'Salvar Contatos'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Atendimento e Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
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
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
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
              
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nova Observação / Interação
                </label>
                <textarea 
                  className={`w-full flex-1 min-h-[120px] border rounded-xl p-4 text-sm text-slate-700 focus:outline-none transition-all resize-none shadow-sm ${
                    !isEditing 
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed' 
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400'
                  }`}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva aqui os principais pontos desta interação para salvar no histórico..."
                  disabled={isSaving || !isEditing}
                  readOnly={!isEditing}
                />

                {/* --- AÇÃO DE TROCA RÁPIDA (SOMENTE SE JÁ FOI FINALIZADO E ESTÁ EDITANDO) --- */}
                {isFinished && isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Ação Rápida: Salvar e Alterar Status para
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleQuickUpdate('APROVADO')}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Interessado
                      </button>

                      <button
                        onClick={() => handleQuickUpdate('POSSIBILIDADE')}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm disabled:opacity-50"
                      >
                        <Target size={14} /> Possibilidade
                      </button>

                      <button
                        onClick={() => handleQuickUpdate('REPROVADO')}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm disabled:opacity-50"
                      >
                        <XCircle size={14} /> Não Interessado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto max-h-[400px]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
                <History size={14} /> Linha do Tempo
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-2 space-y-6">
                {loadingHistorico ? (
                  <p className="pl-6 text-sm text-slate-400 animate-pulse">Carregando histórico...</p>
                ) : historico.length === 0 ? (
                  <p className="pl-6 text-sm text-slate-400 italic">Nenhum histórico registrado ainda.</p>
                ) : (
                  historico.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                            {item.acao}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {item.observacoes ? (
                          <p className="text-sm text-slate-600 leading-relaxed mb-3 break-words">
                            "{item.observacoes}"
                          </p>
                        ) : (
                          <p className="text-xs italic text-slate-400 mb-3">Sem observações descritivas.</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 truncate max-w-[120px]">
                            <User size={10} /> {item.usuario}
                          </span>
                          <div className="flex gap-1 flex-wrap justify-end pl-2">
                            {item.novosModulos?.map(m => (
                              <span key={m} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer com Botões */}
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
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition-all border border-blue-200 w-full sm:w-auto"
                    >
                      <Edit3 size={16} />
                      Nova Interação / Editar
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex justify-center items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all w-full sm:w-auto"
                    >
                      Fechar
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setIsEditing(false); setObservacoes(''); }}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100 transition-all w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="flex justify-center items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 w-full sm:w-auto"
                    >
                      <Save size={16} />
                      {isSaving ? 'Salvando...' : 'Apenas Salvar Nota'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => handleSubmit('PENDENTE')}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                <ArrowLeft size={16} />
                Desistir / Voltar
              </button>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-center">
                <button 
                  onClick={() => handleSubmit('REPROVADO')}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 shadow-sm"
                >
                  <XCircle size={16} />
                  Não interessado
                </button>
                
                <button 
                  onClick={() => handleSubmit('RETORNAR')}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-purple-200 text-purple-600 font-bold rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Clock size={16} />
                  {isSaving ? '...' : 'Retornar'}
                </button>
                
                <button 
                  onClick={() => handleSubmit('POSSIBILIDADE')}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-blue-200 text-blue-600 font-bold rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Target size={16} />
                  {isSaving ? '...' : 'Possibilidade'}
                </button>

                <button 
                  onClick={() => handleSubmit('APROVADO')}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle2 size={16} />
                  {isSaving ? '...' : 'Interessado'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}