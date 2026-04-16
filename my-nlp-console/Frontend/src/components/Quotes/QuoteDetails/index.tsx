import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Mail, Phone, MapPin, 
  CheckSquare, DollarSign, Send, CheckCircle2, 
  Clock, FileEdit, Copy, Check, ExternalLink, User, Pencil
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { IQuote } from '../types';
import { api } from '../../../services/api'; 
import QuoteModal from '../QuoteModal'; 

export default function QuoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/quotes/${id}`);
      setQuote(response.data);
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

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const handleCopyCnpj = async (cnpj: string) => {
    if (!cnpj) return;
    try {
      await navigator.clipboard.writeText(cnpj);
      setCopiedCnpj(true);
      setTimeout(() => setCopiedCnpj(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar CNPJ', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
  const currentStepIdx = steps.indexOf(quote.status?.toUpperCase() || 'RASCUNHO');

  return (
    <>
      <div className="h-full flex flex-col bg-[#f8fafc] font-sans">
        {/* HEADER DA PÁGINA */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-20 relative">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex items-start gap-4">
              <button 
                onClick={() => navigate('/orcamentos')}
                className="p-2 mt-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Voltar para lista"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <div className="text-slate-400 text-xs mb-1.5 font-medium tracking-wide">
                  Orçamentos / <span className="text-slate-500">{quote.nomeCliente}</span> / Pedido #{formattedId}
                </div>
                
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-8">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Pedido #{formattedId}
                  </h1>
                  
                  {/* Status Stepper */}
                  <div className="flex items-center gap-2">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <React.Fragment key={step}>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isCurrent ? 'bg-blue-100 text-blue-700' : 
                            isCompleted ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {isCompleted && <CheckCircle2 size={12} className={isCurrent ? "text-blue-600" : "text-emerald-500"} />}
                            {step}
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={`w-4 h-0.5 rounded ${idx < currentStepIdx ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* AÇÕES PRIMÁRIAS */}
            <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95">
                <Send size={16} />
                Enviar Proposta
              </button>
            </div>
          </div>
        </header>

        {/* CORPO DA PÁGINA (Mantido exatamente como o seu original, apenas para contexto de estrutura) */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* COLUNA PRINCIPAL */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* DADOS DO CLIENTE */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building size={16} className="text-slate-400" />
                    Informações do Cliente
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Empresa</label>
                      <p className="text-sm font-semibold text-slate-900">{quote.nomeCliente}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">CNPJ</label>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-semibold text-slate-900">{quote.cnpj || 'Não informado'}</p>
                        {quote.cnpj && (
                          <button 
                            onClick={() => handleCopyCnpj(quote.cnpj!)}
                            className="text-slate-300 hover:text-blue-600 transition-colors relative"
                            title="Copiar CNPJ"
                          >
                            {copiedCnpj ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Telefone Principal</label>
                      <a href={`tel:${quote.telefonePrincipal?.replace(/\D/g, '')}`} className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group">
                        <Phone size={14} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-sm font-semibold">{quote.telefonePrincipal}</span>
                      </a>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">E-mail</label>
                      {quote.email ? (
                        <a href={`mailto:${quote.email}`} className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group">
                          <Mail size={14} className="text-slate-400 group-hover:text-blue-500" />
                          <span className="text-sm font-semibold">{quote.email}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail size={14} className="text-slate-300" />
                          <span className="text-sm font-medium">Não informado</span>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Endereço</label>
                      {quote.endereco ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(quote.endereco)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group"
                        >
                          <MapPin size={14} className="text-slate-400 group-hover:text-blue-500" />
                          <span className="text-sm font-semibold">{quote.endereco}</span>
                          <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={14} className="text-slate-300" />
                          <span className="text-sm font-medium">Não informado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ESCOPO / MÓDULOS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare size={16} className="text-slate-400" />
                    Escopo do Projeto
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {modulos.map((modulo: string) => (
                      <span key={modulo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded text-xs font-bold">
                        <CheckCircle2 size={14} className="text-slate-400" />
                        {modulo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES E NOTAS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileEdit size={16} className="text-slate-400" />
                    Observações e Interesses
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Interesses do Cliente</h3>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-sm text-slate-700 min-h-20 prose prose-sm prose-slate max-w-none">
                      {quote.interesses ? (
                        <ReactMarkdown>{quote.interesses}</ReactMarkdown>
                      ) : (
                        <span className="text-slate-400 font-medium">Nenhum interesse registrado.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notas Internas de Negociação</h3>
                    <div className="bg-yellow-50/50 p-5 rounded-lg border border-yellow-100 text-sm text-slate-800 min-h-20 prose prose-sm prose-slate max-w-none">
                      {quote.observacoes ? (
                        <ReactMarkdown>{quote.observacoes}</ReactMarkdown>
                      ) : (
                        <span className="text-slate-400 font-medium">Nenhuma observação interna registrada.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUNA LATERAL */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden top-6 z-10 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign size={16} className="text-slate-400" />
                    Resumo Financeiro
                  </h2>
                </div>
                <div className="p-6 space-y-5 flex-1">
                  
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ciclo</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">MENSAL</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Valor de Tabela</span>
                    <span className={`text-sm font-bold ${quote.valorNegociado ? 'line-through text-slate-300' : 'text-slate-900'}`}>
                      {formatarMoeda(quote.valorBase || 0)}
                    </span>
                  </div>

                  {quote.valorNegociado && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-emerald-600">Valor Negociado</span>
                      <span className="text-sm font-black text-emerald-700">
                        {formatarMoeda(quote.valorNegociado)}
                      </span>
                    </div>
                  )}

                  <div className="pt-6 mt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total a Pagar / Mês</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatarMoeda(quote.valorNegociado || quote.valorBase || 0)}
                    </p>
                  </div>

                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-sm hover:shadow-lg flex items-center justify-center gap-2 active:scale-95">
                    <CheckCircle2 size={18} />
                    Aprovar Pedido
                  </button>
                </div>
              </div>

              {/* TIMELINE DE HISTÓRICO */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Histórico
                  </h2>
                </div>
                <div className="p-6">
                  <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                    
                    {/* Evento Fictício */}
                    <div className="relative">
                      <div className="absolute -left-5.25 bg-slate-200 border-[3px] border-white w-4 h-4 rounded-full mt-1.5"></div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-900">Proposta Ajustada</p>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Vendedor Admin</span>
                          <span className="text-[10px]">•</span>
                          <span className="text-[10px] font-semibold">{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="mt-2 bg-slate-50 p-3 rounded border border-slate-100 text-xs text-slate-600 font-medium">
                          Valor negociado alterado com desconto de 10% autorizado pela gerência.
                        </div>
                      </div>
                    </div>

                    {/* Evento Inicial de Criação */}
                    <div className="relative">
                      <div className="absolute -left-5.25 bg-slate-200 border-[3px] border-white w-4 h-4 rounded-full mt-1.5"></div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-900">Orçamento Criado</p>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Sistema</span>
                          <span className="text-[10px]">•</span>
                          <span className="text-[10px] font-semibold">
                            {new Date(quote.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Modal de Edição na página de detalhes */}
      {isEditModalOpen && (
        <QuoteModal 
          quote={quote} 
          onClose={() => {
            setIsEditModalOpen(false);
            fetchQuoteDetails(); // Recarrega os dados após edição
          }} 
        />
      )}
    </>
  );
}