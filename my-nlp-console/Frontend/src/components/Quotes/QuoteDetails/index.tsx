import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Mail, Phone, MapPin, 
  CheckSquare, DollarSign, Send, CheckCircle2, 
  Clock, Copy, Check, ExternalLink, User, Pencil,
  CornerDownLeft, Loader2 
} from 'lucide-react';
import type { IQuote, IQuoteNote } from '../types';
import { QuoteService } from '../../../services/quote.service'; 
import QuoteModal from '../QuoteModal'; 
import EnviarPropostaModal from './EnviarPropostaModal'; 

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 2. ESTADO DO NOVO MODAL
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [forceStatusModal, setForceStatusModal] = useState<{isOpen: boolean, targetStatus: string}>({ isOpen: false, targetStatus: '' });
  const [forcePassword, setForcePassword] = useState('');
  const [isForcingStatus, setIsForcingStatus] = useState(false);
  const [forceError, setForceError] = useState('');

  let currentUser = { id: '', nome: 'Usuário Desconhecido' };
  try {
    const userStr = localStorage.getItem('@CRM:user');
    if (userStr) currentUser = JSON.parse(userStr);
  } catch (e) {
    console.error('Erro ao ler usuário', e);
  }

  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    try {
      const data = await QuoteService.getById(Number(id));
      setQuote(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do orçamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const handleSubmitNote = async () => {
    if (!newNote.trim() || !quote?.id) return;
    
    setIsSubmittingNote(true);
    try {
      const novaNota = await QuoteService.addNote(
        Number(quote.id), 
        newNote.trim(), 
        currentUser.nome 
      );

      setQuote(prev => prev ? {
        ...prev,
        notas: [novaNota, ...(prev.notas || [])]
      } : null);
      
      setNewNote('');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleNewNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitNote();
    }
  };

  const handleForceStatus = async () => {
    if (!forcePassword.trim() || !quote?.id) return;
    
    setIsForcingStatus(true);
    setForceError('');
    
    try {
      if (!currentUser.nome) throw new Error('Sessão expirada');
      
      await QuoteService.forceStatusUpdate(Number(quote.id), forceStatusModal.targetStatus, currentUser.nome, forcePassword);
      
      await fetchQuoteDetails(); 
      
      setForceStatusModal({ isOpen: false, targetStatus: '' });
      setForcePassword('');
    } catch (error: any) {
      setForceError(error.response?.data?.error || 'Erro ao validar senha');
    } finally {
      setIsForcingStatus(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '--/--/----';
    return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleCopyCnpj = async (cnpj: string) => {
    if (!cnpj) return;
    try {
      await navigator.clipboard.writeText(cnpj.replace(/\D/g, ''));
      setCopiedCnpj(true);
      setTimeout(() => setCopiedCnpj(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar CNPJ', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <h2 className="text-xl font-bold text-slate-800">Orçamento não encontrado</h2>
        <button onClick={() => navigate('/orcamentos')} className="mt-4 text-blue-600 hover:underline">
          Voltar para listagem
        </button>
      </div>
    );
  }

  const modulos = quote.modulos || ['Financeiro', 'NFe', 'Estoque'];
  const formattedId = String(quote.id || '0000').padStart(4, '0');
  const steps = ['RASCUNHO', 'ENVIADO', 'APROVADO'];
  const currentStatus = (quote.status?.toUpperCase() || 'RASCUNHO');
  const currentStepIdx = steps.indexOf(currentStatus);

  return (
    <>
      <div className="h-full flex flex-col bg-[#f8fafc] font-sans overflow-hidden">

        <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex items-start gap-4 md:ml-5">
              <button 
                onClick={() => navigate('/orcamentos')}
                className="relative z-30 p-2 mt-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Voltar para Orçamentos"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-medium uppercase tracking-wider">
                  <span 
                    onClick={() => navigate('/orcamentos')}
                    className="relative z-30 cursor-pointer hover:text-blue-600 transition-colors"
                    title="Voltar para Orçamentos"
                  >
                    Orçamentos
                  </span> / <span className="text-slate-500">{quote.nomeCliente}</span> / Pedido #{formattedId}
                </div>
                
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-8">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Pedido #{formattedId}
                  </h1>
                  
                  <div className="flex items-center gap-1.5">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <React.Fragment key={step}>
                          <button 
                            onClick={() => !isCurrent && setForceStatusModal({ isOpen: true, targetStatus: step })}
                            title={!isCurrent ? `Forçar alteração para ${step}` : ''}
                            disabled={isCurrent}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                              !isCurrent ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm' : 'cursor-default'
                            } ${
                              isCurrent ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30 ring-offset-1' : 
                              isCompleted ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                              'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {(isCompleted || isCurrent) && <Check size={12} />}
                            {step}
                          </button>
                          {idx < steps.length - 1 && (
                            <div className={`w-6 h-0.5 rounded ${idx < currentStepIdx ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                <Pencil size={16} />
                Editar
              </button>
              
              {/* 3. AQUI NO BOTÃO ADICIONEI O onClick QUE ABRE O MODAL */}
              <button 
                onClick={() => setIsSendModalOpen(true)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Send size={16} />
                Enviar Proposta
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUNA PRINCIPAL (2/3) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} />
                    Dados do Cliente
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Empresa</label>
                      <p className="text-sm font-bold text-slate-900">{quote.nomeCliente}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CNPJ</label>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-semibold text-slate-700">{quote.cnpj || 'Não informado'}</p>
                        {quote.cnpj && (
                          <button 
                            onClick={() => handleCopyCnpj(quote.cnpj!)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-all"
                            title="Copiar apenas números"
                          >
                            {copiedCnpj ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Contato Direto</label>
                        <div className="flex flex-col gap-3">
                        {quote.email && (
                            <a 
                            href={`mailto:${quote.email}`} 
                            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition-colors group w-fit"
                            >
                            <Mail size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                            <span className="font-semibold">{quote.email}</span>
                            <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all duration-300 -ml-0.5" />
                            </a>
                        )}
                        
                        {quote.telefonePrincipal && (
                            <a 
                            href={`tel:${quote.telefonePrincipal.replace(/\D/g, '')}`} 
                            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition-colors group w-fit"
                            >
                            <Phone size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                            <span className="font-semibold">{quote.telefonePrincipal}</span>
                            <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all duration-300 -ml-0.5" />
                            </a>
                        )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Localização</label>
                        {quote.endereco ? (
                        <a 
                            href={`https://maps.google.com/?q=$${encodeURIComponent(quote.endereco)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition-colors group w-fit"
                        >
                            <MapPin size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                            <span className="font-semibold">{quote.endereco}</span>
                            <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all duration-300 -ml-0.5 shrink-0" />
                        </a>
                        ) : (
                        <p className="text-sm text-slate-400 italic px-1">Endereço não informado</p>
                        )}
                    </div>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckSquare size={14} />
                    Escopo do Projeto
                  </h2>
                </div>
                <div className="p-6 flex flex-wrap gap-2">
                  {modulos.map((modulo: string) => (
                    <span key={modulo} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[11px] font-bold uppercase tracking-tight">
                      {modulo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-112.5">
                <div className="px-6 py-3 border-b border-slate-100 shrink-0">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Pencil size={14} />
                    Anotações
                  </h2>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="grid grid-cols-[80px_130px_1fr] gap-4 px-6 py-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anotação</div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {quote.interesses && (
                      <div className="grid grid-cols-[80px_130px_1fr] gap-4 px-6 py-2.5 border-b border-slate-100 items-start hover:bg-slate-50/50 transition-colors">
                        <div className="text-[11px] text-slate-500 pt-0.5">{formatarData(quote.createdAt)}</div>
                        <div className="text-[11px] font-semibold text-slate-700 truncate pt-0.5">Sistema</div>
                        <div className="text-[12px] text-slate-700 leading-relaxed">
                          <span className="font-bold mr-1 text-slate-900">Interesses:</span>
                          {quote.interesses}
                        </div>
                      </div>
                    )}

                    {quote.observacoes && (
                      <div className="grid grid-cols-[80px_130px_1fr] gap-4 px-6 py-2.5 border-b border-slate-100 items-start hover:bg-slate-50/50 transition-colors">
                        <div className="text-[11px] text-slate-500 pt-0.5">{formatarData(quote.createdAt)}</div>
                        <div className="text-[11px] font-semibold text-slate-700 truncate pt-0.5">Sistema</div>
                        <div className="text-[12px] text-slate-700 leading-relaxed">
                          <span className="font-bold mr-1 text-slate-900">Obs. Iniciais:</span>
                          {quote.observacoes}
                        </div>
                      </div>
                    )}

                    {quote.notas?.map((nota: IQuoteNote) => (
                      <div key={nota.id} className="grid grid-cols-[80px_130px_1fr] gap-4 px-6 py-2.5 border-b border-slate-100 items-start hover:bg-slate-50/50 transition-colors group">
                        <div className="text-[11px] text-slate-500 pt-0.5">{formatarData(nota.createdAt)}</div>
                        <div className="text-[11px] font-semibold text-slate-700 truncate pt-0.5">{nota.usuario}</div>
                        <div className="text-[12px] text-slate-700 relative w-full">
                          <div className="px-1 -mx-1 rounded whitespace-pre-wrap leading-relaxed border border-transparent">
                            {nota.texto}
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!quote.notas?.length && !quote.interesses && !quote.observacoes) && (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">
                        Nenhum registro encontrado.
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 rounded-b-xl flex flex-col gap-2">
                  <div className="relative flex items-end gap-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={handleNewNoteKeyDown}
                      placeholder="Adicionar anotação..."
                      className="w-full bg-slate-50 border border-slate-200 text-[12px] text-slate-700 rounded-lg px-4 py-2.5 min-h-11 max-h-30 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all custom-scrollbar"
                      rows={1}
                      disabled={isSubmittingNote}
                    />
                    <button
                      onClick={handleSubmitNote}
                      disabled={!newNote.trim() || isSubmittingNote}
                      className="h-11 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors shrink-0 flex items-center justify-center font-bold text-[11px] uppercase tracking-wider"
                    >
                      {isSubmittingNote ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-1">
                    <span>* Ao terminar de digitar pressione</span>
                    <span className="font-bold flex items-center gap-0.5 px-1 bg-slate-100 rounded border border-slate-200">
                      Enter <CornerDownLeft size={10} />
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUNA LATERAL (1/3) */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden top-6">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-900">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-blue-400" />
                    Resumo Financeiro
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Valor de Tabela</span>
                    <span className={quote.valorNegociado ? 'line-through text-slate-300' : 'text-slate-900'}>
                      {formatarMoeda(quote.valorBase || 0)}
                    </span>
                  </div>
                  
                  {quote.valorNegociado && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600 font-bold">Valor Negociado</span>
                      <span className="text-emerald-700 font-black">{formatarMoeda(quote.valorNegociado)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total a Pagar / Mês</label>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                      {formatarMoeda(quote.valorNegociado || quote.valorBase || 0)}
                    </p>
                  </div>

                  <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95">
                    <CheckCircle2 size={20} />
                    APROVAR PEDIDO
                  </button>
                </div>
              </div>

              {/* LINHA DO TEMPO */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} />
                    Histórico de Ações
                  </h2>
                </div>
                <div className="p-6">
                  <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                    
                    {quote.historico && quote.historico.length > 0 ? (
                      quote.historico.map((item, index) => {
                        const isLatest = index === 0;
                        
                        return (
                          <div key={item.id} className={`relative ${!isLatest ? 'opacity-60' : ''}`}>
                            <div className={`absolute -left-7.75 border-4 border-white w-3.5 h-3.5 rounded-full top-1 ${isLatest ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'}`}></div>
                            
                            <div className={isLatest ? "bg-white border border-slate-100 p-3 rounded-lg shadow-sm" : "p-1"}>
                              <p className={`text-xs font-bold ${isLatest ? 'text-slate-900' : 'text-slate-800'}`}>
                                {item.acao}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                <User size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.usuario}</span>
                                <span className="text-[9px]">• {formatarData(item.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic py-4">Nenhum histórico registrado.</p>
                    )}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {forceStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                Ação Restrita
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Você está forçando o status para <span className="font-bold">"{forceStatusModal.targetStatus}"</span>.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Confirme sua senha</label>
                <input 
                  type="password"
                  autoFocus
                  value={forcePassword}
                  onChange={(e) => setForcePassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForceStatus()}
                  className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                {forceError && <p className="text-xs font-semibold text-rose-500 mt-2">{forceError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setForceStatusModal({ isOpen: false, targetStatus: '' }); setForcePassword(''); setForceError(''); }}
                  disabled={isForcingStatus}
                  className="flex-1 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleForceStatus}
                  disabled={isForcingStatus || !forcePassword}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isForcingStatus ? <Loader2 size={16} className="animate-spin" /> : 'AUTORIZAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AQUI O SEU COMPONENTE DO MODAL ESTÁ DE FATO RENDERIZANDO NA TELA */}
      {isSendModalOpen && quote && (
        <EnviarPropostaModal 
          quote={quote}
          usuarioAtual={currentUser}
          onClose={() => setIsSendModalOpen(false)}
          onSuccess={() => {
            setIsSendModalOpen(false);
            fetchQuoteDetails(); 
          }}
        />
      )}

      {isEditModalOpen && (
        <QuoteModal 
          quote={quote} 
          onClose={() => {
            setIsEditModalOpen(false);
            fetchQuoteDetails();
          }} 
        />
      )}
    </>
  );
}