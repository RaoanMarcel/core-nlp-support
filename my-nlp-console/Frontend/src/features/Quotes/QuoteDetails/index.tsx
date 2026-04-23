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
import ConfirmacaoAprovacaoModal from '../../Orders/ConfirmacaoAprovacaoModal';
import { OrderService } from '../../../services/order.service';

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  
  // Estados dos Modais de Pedido
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [forceStatusModal, setForceStatusModal] = useState<{isOpen: boolean, targetStatus: string}>({ isOpen: false, targetStatus: '' });
  const [forcePassword, setForcePassword] = useState('');
  const [isForcingStatus, setIsForcingStatus] = useState(false);
  const [forceError, setForceError] = useState('');

  let currentUser = { id: '', nome: 'Usuário Desconhecido', login: '' };
  try {
    const userStr = localStorage.getItem('@CRM:user');
    if (userStr) currentUser = JSON.parse(userStr);
  } catch (e) {
    console.error('Erro ao ler utilizador', e);
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
      
      const loginParaValidar = currentUser.login || currentUser.nome.toLowerCase();
      
      await QuoteService.forceStatusUpdate(Number(quote.id), forceStatusModal.targetStatus, loginParaValidar, forcePassword);
      
      await fetchQuoteDetails(); 
      
      setForceStatusModal({ isOpen: false, targetStatus: '' });
      setForcePassword('');
    } catch (error: any) {
      setForceError(error.response?.data?.error || 'Erro ao validar senha');
    } finally {
      setIsForcingStatus(false);
    }
  };


  const handleConfirmOrder = async () => {
    if (!quote?.id) {
      alert("Erro: O ID do orçamento não foi encontrado.");
      return;
    }

    try {
      const response = await OrderService.gerarPedido(quote.id);
      
      console.log('Pedido gerado com sucesso no backend:', response);
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(response.linkAssinatura);
      }
      
      setGeneratedLink(response.linkAssinatura);
      setIsConfirmOrderModalOpen(false);
      setIsLinkModalOpen(true);
      
      await fetchQuoteDetails();

    } catch (error: any) {
      console.error('Erro ao gerar pedido:', error);
      const mensagemErro = error.response?.data?.error || error.message || 'Erro inesperado ao conectar com o servidor.';
      alert(`❌ Erro ao gerar pedido: ${mensagemErro}`);
      
      throw error; 
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
  const steps = ['RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO'];
  const currentStatus = (quote.status?.toUpperCase() || 'RASCUNHO');
  const currentStepIdx = steps.indexOf(currentStatus);

return (
    <>
      <div className="h-full flex flex-col bg-theme-base font-sans overflow-hidden">

        <header className="bg-theme-panel border-b border-theme-border px-4 sm:px-6 py-4 shrink-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
            
            <div className="flex items-start gap-3 sm:gap-4 md:ml-5 w-full lg:w-auto overflow-hidden">
              <button 
                onClick={() => navigate('/orcamentos')}
                className="relative z-30 p-2 mt-1 text-theme-muted hover:text-theme-text hover:bg-theme-base rounded-full transition-colors shrink-0"
                title="Voltar para Orçamentos"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="min-w-0 flex-1"> {/* min-w-0 evita que o flex item vaze a tela no mobile */}
                <div className="text-theme-muted text-[11px] mb-1 font-medium uppercase tracking-wider truncate">
                  <span 
                    onClick={() => navigate('/orcamentos')}
                    className="relative z-30 cursor-pointer hover:text-theme-accent transition-colors"
                    title="Voltar para Orçamentos"
                  >
                    Orçamentos
                  </span> / <span className="text-theme-muted truncate">{quote.nomeCliente}</span> / #{formattedId}
                </div>
                
                <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-8">
                  <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight truncate">
                    Orçamento #{formattedId}
                  </h1>
                  
                  {/* Container dos Steps com flex-wrap para mobile */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <React.Fragment key={step}>
                          <button 
                            onClick={() => !isCurrent && setForceStatusModal({ isOpen: true, targetStatus: step })}
                            title={!isCurrent ? `Forçar alteração para ${step}` : ''}
                            disabled={isCurrent}
                            className={`flex items-center gap-1 shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
                              !isCurrent ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm' : 'cursor-default'
                            } ${
                              isCurrent ? 'bg-theme-accent text-white shadow-sm ring-2 ring-theme-accent/30 ring-offset-1' : 
                              isCompleted ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                              'bg-theme-base text-theme-muted hover:bg-theme-border hover:text-theme-text'
                            }`}
                          >
                            {(isCompleted || isCurrent) && <Check size={12} />}
                            {step}
                          </button>
                          {idx < steps.length - 1 && (
                            <div className={`hidden sm:block w-4 sm:w-6 h-0.5 rounded shrink-0 ${idx < currentStepIdx ? 'bg-emerald-200' : 'bg-theme-border'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-2 bg-theme-panel border border-theme-border hover:border-theme-text text-theme-text px-4 py-2 sm:py-2.5 rounded-shape-lg text-sm font-bold transition-all"
              >
                <Pencil size={16} />
                Editar
              </button>
              
              <button 
                onClick={() => setIsSendModalOpen(true)} 
                className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-2 bg-theme-accent hover:opacity-90 text-white px-5 py-2 sm:py-2.5 rounded-shape-lg text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Send size={16} />
                Enviar Proposta
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            
            {/* COLUNA PRINCIPAL (2/3) */}
            <div className="xl:col-span-2 flex flex-col gap-4 sm:gap-6">
              
              <div className="bg-theme-panel rounded-shape-lg border border-theme-border shadow-sm overflow-hidden shrink-0">
                <div className="px-4 sm:px-6 py-3 border-b border-theme-border bg-theme-base/50">
                  <h2 className="text-[11px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} />
                    Dados do Cliente
                  </h2>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-1">Empresa</label>
                      <p className="text-sm font-bold text-theme-text wraP-break-word">{quote.nomeCliente}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-1">CNPJ</label>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-semibold text-theme-text">{quote.cnpj || 'Não informado'}</p>
                        {quote.cnpj && (
                          <button 
                            onClick={() => handleCopyCnpj(quote.cnpj!)}
                            className="p-1 hover:bg-theme-base rounded-shape text-theme-muted hover:text-theme-accent transition-all"
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
                        <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-2">Contato Direto</label>
                        <div className="flex flex-col gap-3">
                        {quote.email && (
                            <a 
                            href={`mailto:${quote.email}`} 
                            className="inline-flex items-center gap-2 text-sm text-theme-text hover:text-theme-accent transition-colors group w-fit max-w-full"
                            >
                            <Mail size={16} className="text-theme-muted group-hover:text-theme-accent transition-colors shrink-0" />
                            <span className="font-semibold truncate">{quote.email}</span>
                            <ExternalLink size={14} className="text-theme-muted opacity-0 group-hover:opacity-100 group-hover:text-theme-accent transition-all duration-300 -ml-0.5 shrink-0 hidden sm:block" />
                            </a>
                        )}
                        
                        {quote.telefonePrincipal && (
                            <a 
                            href={`tel:${quote.telefonePrincipal.replace(/\D/g, '')}`} 
                            className="inline-flex items-center gap-2 text-sm text-theme-text hover:text-theme-accent transition-colors group w-fit"
                            >
                            <Phone size={16} className="text-theme-muted group-hover:text-theme-accent transition-colors shrink-0" />
                            <span className="font-semibold">{quote.telefonePrincipal}</span>
                            <ExternalLink size={14} className="text-theme-muted opacity-0 group-hover:opacity-100 group-hover:text-theme-accent transition-all duration-300 -ml-0.5 shrink-0 hidden sm:block" />
                            </a>
                        )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-2">Localização</label>
                        {quote.endereco ? (
                        <a 
                            href={`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(quote.endereco)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-start sm:items-center gap-2 text-sm text-theme-text hover:text-theme-accent transition-colors group w-fit"
                        >
                            <MapPin size={16} className="text-theme-muted group-hover:text-theme-accent shrink-0 transition-colors mt-0.5 sm:mt-0" />
                            <span className="font-semibold">{quote.endereco}</span>
                            <ExternalLink size={14} className="text-theme-muted opacity-0 group-hover:opacity-100 group-hover:text-theme-accent transition-all duration-300 -ml-0.5 shrink-0 hidden sm:block" />
                        </a>
                        ) : (
                        <p className="text-sm text-theme-muted italic px-1">Endereço não informado</p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-theme-panel rounded-shape-lg border border-theme-border shadow-sm overflow-hidden shrink-0">
                <div className="px-4 sm:px-6 py-3 border-b border-theme-border bg-theme-base/50">
                  <h2 className="text-[11px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
                    <CheckSquare size={14} />
                    Escopo do Projeto
                  </h2>
                </div>
                <div className="p-4 sm:p-6 flex flex-wrap gap-2">
                  {modulos.map((modulo: string) => (
                    <span key={modulo} className="px-3 py-1 bg-theme-base border border-theme-border text-theme-text rounded-shape text-[10px] sm:text-[11px] font-bold uppercase tracking-tight">
                      {modulo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-theme-panel rounded-shape-lg border border-theme-border shadow-sm flex flex-col flex-1 min-h-100">
                <div className="px-4 sm:px-6 py-3 border-b border-theme-border shrink-0">
                  <h2 className="text-[11px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
                    <Pencil size={14} />
                    Anotações
                  </h2>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Tabela de anotações com scroll horizontal em mobile se necessário */}
                  <div className="overflow-x-auto flex-1 flex flex-col">
                    <div className="min-w-[320px] flex-1 flex flex-col">
                      <div className="grid grid-cols-[60px_90px_1fr] sm:grid-cols-[80px_130px_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-2 border-b border-theme-border bg-theme-base top-0 z-10 shrink-0">
                        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-theme-muted">Data</div>
                        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-theme-muted">Usuário</div>
                        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-theme-muted">Anotação</div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {quote.interesses && (
                          <div className="grid grid-cols-[60px_90px_1fr] sm:grid-cols-[80px_130px_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 border-b border-theme-border items-start hover:bg-theme-base transition-colors">
                            <div className="text-[10px] sm:text-[11px] text-theme-muted pt-0.5">{formatarData(quote.createdAt)}</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-theme-text truncate pt-0.5">Sistema</div>
                            <div className="text-[11px] sm:text-[12px] text-theme-text leading-relaxed wrap-break-word">
                              <span className="font-bold mr-1">Interesses:</span>
                              {quote.interesses}
                            </div>
                          </div>
                        )}

                        {quote.observacoes && (
                          <div className="grid grid-cols-[60px_90px_1fr] sm:grid-cols-[80px_130px_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 border-b border-theme-border items-start hover:bg-theme-base transition-colors">
                            <div className="text-[10px] sm:text-[11px] text-theme-muted pt-0.5">{formatarData(quote.createdAt)}</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-theme-text truncate pt-0.5">Sistema</div>
                            <div className="text-[11px] sm:text-[12px] text-theme-text leading-relaxed wrap-break-word">
                              <span className="font-bold mr-1">Obs. Iniciais:</span>
                              {quote.observacoes}
                            </div>
                          </div>
                        )}

                        {quote.notas?.map((nota: IQuoteNote) => (
                          <div key={nota.id} className="grid grid-cols-[60px_90px_1fr] sm:grid-cols-[80px_130px_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 border-b border-theme-border items-start hover:bg-theme-base transition-colors group">
                            <div className="text-[10px] sm:text-[11px] text-theme-muted pt-0.5">{formatarData(nota.createdAt)}</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-theme-text truncate pt-0.5" title={nota.usuario}>{nota.usuario}</div>
                            <div className="text-[11px] sm:text-[12px] text-theme-text relative w-full">
                              <div className="px-1 -mx-1 rounded-shape whitespace-pre-wrap leading-relaxed border border-transparent wrap-break-word">
                                {nota.texto}
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!quote.notas?.length && !quote.interesses && !quote.observacoes) && (
                          <div className="py-8 text-center text-xs text-theme-muted font-medium">
                            Nenhum registro encontrado.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-4 border-t border-theme-border bg-theme-panel shrink-0 rounded-b-shape-lg flex flex-col gap-2">
                  <div className="relative flex items-end gap-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={handleNewNoteKeyDown}
                      placeholder="Adicionar anotação..."
                      className="w-full bg-theme-base border border-theme-border text-[12px] text-theme-text rounded-shape-lg px-3 sm:px-4 py-2.5 min-h-11 max-h-30 resize-none focus:outline-none focus:ring-1 focus:ring-theme-accent focus:bg-theme-panel transition-all custom-scrollbar"
                      rows={1}
                      disabled={isSubmittingNote}
                    />
                    <button
                      onClick={handleSubmitNote}
                      disabled={!newNote.trim() || isSubmittingNote}
                      className="h-11 px-3 sm:px-4 bg-theme-text text-theme-panel rounded-shape-lg hover:opacity-90 disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center font-bold text-[10px] sm:text-[11px] uppercase tracking-wider"
                    >
                      {isSubmittingNote ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
                    </button>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-theme-muted flex items-center gap-1.5 ml-1">
                    <span className="hidden sm:inline">* Ao terminar de digitar pressione</span>
                    <span className="sm:hidden">* Pressione</span>
                    <span className="font-bold flex items-center gap-0.5 px-1 bg-theme-base rounded-shape border border-theme-border">
                      Enter <CornerDownLeft size={10} />
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUNA LATERAL (1/3) */}
            <div className="space-y-4 sm:space-y-6">
              
              <div className="bg-theme-panel rounded-shape-lg border border-theme-border shadow-sm overflow-hidden xl:top-6">
                <div className="px-4 sm:px-6 py-4 border-b border-theme-border bg-theme-base">
                  <h2 className="text-[11px] font-bold text-theme-text uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-theme-accent" />
                    Resumo Financeiro
                  </h2>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-theme-muted">Valor de Tabela</span>
                    <span className={quote.valorNegociado ? 'line-through text-theme-muted text-xs' : 'text-theme-text'}>
                      {formatarMoeda(quote.valorBase || 0)}
                    </span>
                  </div>
                  
                  {quote.valorNegociado && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600 font-bold">Valor Negociado</span>
                      <span className="text-emerald-700 font-black">{formatarMoeda(quote.valorNegociado)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-theme-border">
                    <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest block mb-1">Total a Pagar / Mês</label>
                    <p className="text-3xl sm:text-4xl font-black text-theme-text tracking-tighter wrap-break-word">
                      {formatarMoeda(quote.valorNegociado || quote.valorBase || 0)}
                    </p>
                  </div>

                  {currentStatus !== 'APROVADO' && currentStatus !== 'REJEITADO' && (
                    <>
                      <button 
                        onClick={() => setIsConfirmOrderModalOpen(true)}
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 sm:py-2 rounded-shape-lg transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95"
                      >
                        <CheckCircle2 size={20} />
                        GERAR PEDIDO
                      </button>

                      <button 
                        onClick={() => setForceStatusModal({ isOpen: true, targetStatus: 'REJEITADO' })}
                        className="w-full mt-3 py-2 sm:py-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-shape-lg text-[10px] sm:text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                      >
                        Orçamento Rejeitado
                      </button>
                    </>
                  )}

                  {currentStatus === 'APROVADO' && (
                    <div className="w-full mt-4 bg-emerald-100 text-emerald-700 font-black py-3 rounded-shape-lg flex items-center justify-center gap-2 uppercase text-xs sm:text-sm border border-emerald-200">
                      <CheckCircle2 size={18} /> Orçamento Aprovado
                    </div>
                  )}
                  
                  {currentStatus === 'REJEITADO' && (
                    <div className="w-full mt-4 bg-rose-100 text-rose-700 font-black py-3 rounded-shape-lg flex items-center justify-center uppercase text-xs sm:text-sm border border-rose-200">
                      Orçamento Rejeitado
                    </div>
                  )}
                </div>
              </div>

              {/* LINHA DO TEMPO */}
              <div className="bg-theme-panel rounded-shape-lg border border-theme-border shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-theme-border bg-theme-base/50">
                  <h2 className="text-[11px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} />
                    Histórico de Ações
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="relative pl-5 sm:pl-6 border-l-2 border-theme-border space-y-6 sm:space-y-8">
                    
                    {quote.historico && quote.historico.length > 0 ? (
                      quote.historico.map((item, index) => {
                        const isLatest = index === 0;
                        
                        return (
                          <div key={item.id} className={`relative ${!isLatest ? 'opacity-60' : ''}`}>
                            <div className={`absolute -left-6.75 sm:-left-7.75 border-4 border-theme-panel w-3.5 h-3.5 rounded-full top-1 ${isLatest ? 'bg-theme-accent shadow-sm' : 'bg-theme-border'}`}></div>
                            
                            <div className={isLatest ? "bg-theme-panel border border-theme-border p-3 rounded-shape-lg shadow-sm" : "p-1"}>
                              <p className={`text-xs font-bold wrap-break-word ${isLatest ? 'text-theme-text' : 'text-theme-muted'}`}>
                                {item.acao}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-theme-muted">
                                <User size={10} shrink-0 />
                                <span className="text-[9px] font-bold uppercase tracking-tighter truncate max-w-25">{item.usuario}</span>
                                <span className="text-[9px] shrink-0">• {formatarData(item.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-theme-muted font-medium italic py-2 sm:py-4">Nenhum histórico registrado.</p>
                    )}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {forceStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-text/40 backdrop-blur-sm transition-all">
          <div className="bg-theme-panel rounded-shape-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 m-4">
            <div className="px-5 sm:px-6 py-4 bg-amber-50 border-b border-amber-100">
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                Ação Restrita
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Você está forçando o status para <span className="font-bold">"{forceStatusModal.targetStatus}"</span>.
              </p>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-2">Confirme sua senha</label>
                <input 
                  type="password"
                  autoFocus
                  value={forcePassword}
                  onChange={(e) => setForcePassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForceStatus()}
                  className="w-full bg-theme-base border border-theme-border text-sm text-theme-text rounded-shape-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all"
                  placeholder="••••••••"
                />
                {forceError && <p className="text-xs font-semibold text-rose-500 mt-2">{forceError}</p>}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <button 
                  onClick={() => { setForceStatusModal({ isOpen: false, targetStatus: '' }); setForcePassword(''); setForceError(''); }}
                  disabled={isForcingStatus}
                  className="flex-1 px-4 py-2.5 sm:py-2 text-xs font-bold text-theme-muted hover:bg-theme-base rounded-shape-lg transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleForceStatus}
                  disabled={isForcingStatus || !forcePassword}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 sm:py-2 rounded-shape-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isForcingStatus ? <Loader2 size={16} className="animate-spin" /> : 'AUTORIZAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* MODAL: ENVIAR PROPOSTA */}
        {isSendModalOpen && (
          <EnviarPropostaModal
            quote={quote}
            usuarioAtual={currentUser}
            onClose={() => setIsSendModalOpen(false)}
            onSuccess={() => {
              console.log("Proposta enviada com sucesso!");
              setIsSendModalOpen(false);
              fetchQuoteDetails();
            }}
          />
        )}

        {/* MODAL: EDIÇÃO DE ORÇAMENTO */}
        {isEditModalOpen && (
          <QuoteModal
            quote={quote}
            onClose={() => {
              setIsEditModalOpen(false);
              fetchQuoteDetails(); 
            }}
          />
        )}

        {/* MODAL: Confirmação de Aprovação */}
        <ConfirmacaoAprovacaoModal
          isOpen={isConfirmOrderModalOpen}
          onClose={() => setIsConfirmOrderModalOpen(false)}
          onConfirm={handleConfirmOrder}
          data={{
            cliente: quote.nomeCliente,
            cnpj: quote.cnpj || '',
            valor: quote.valorNegociado || quote.valorBase || 0,
            modulos: quote.modulos || []
          }}
        />
        
      </>
  );
}