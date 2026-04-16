import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  X, 
  Calendar, 
  RefreshCw, 
  ChevronRight,
  UserPlus,
  Box,
  Clock,
  CheckCircle2
} from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';
import { api } from '../../services/api';
import { formatarMoeda } from '../ProspectModal/prospectUtils';

export default function QuotesPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteEditando, setQuoteEditando] = useState<IQuote | null>(null);

  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const [quotesList, setQuotesList] = useState<IQuote[]>([]);
  const [leadsAguardando, setLeadsAguardando] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/quotes/consultar', {
        params: {
          termo: termo.trim() || undefined,
          status: statusFiltro !== 'TODOS' ? statusFiltro : undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        }
      });
      setQuotesList(response.data);
    } catch (err: any) {
      console.error("Erro ao buscar orçamentos:", err);
      setError("Erro ao carregar dados do servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [termo, statusFiltro, dataInicio, dataFim]);

  const fetchLeadsAguardando = async () => {
    try {
      const response = await api.get('/prospects', {
        params: { t: new Date().getTime() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const interessados = response.data.filter((p: any) => p.status === 'APROVADO');
      interessados.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      
      setLeadsAguardando(interessados);
    } catch (error) {
      console.error("Erro ao buscar leads aguardando:", error);
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchLeadsAguardando(); 
  }, [statusFiltro, dataInicio, dataFim]);

  const handleOpenNewQuote = (leadData: any = null) => {
    setQuoteEditando(leadData ? { prospectInfo: leadData, ...leadData } : null);
    setIsModalOpen(true);
  };

  const handleEditQuote = (quote: IQuote) => {
    setQuoteEditando(quote);
    setIsModalOpen(true);
  };

  const limparFiltros = () => {
    setTermo('');
    setStatusFiltro('TODOS');
    setDataInicio('');
    setDataFim('');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      APROVADO: "bg-emerald-50 text-emerald-700",
      ENVIADO: "bg-blue-50 text-blue-700",
      REPROVADO: "bg-rose-50 text-rose-700",
      RASCUNHO: "bg-slate-100 text-slate-600"
    };
    const cls = configs[status] || configs.RASCUNHO;
    return (
      <span className={`${cls} px-2 py-1 rounded text-xs font-bold uppercase tracking-widest`}>
        {status.toLowerCase()}
      </span>
    );
  };

  const getStatusBorderClass = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'border-l-emerald-500';
      case 'ENVIADO': return 'border-l-blue-500';
      case 'REPROVADO': return 'border-l-rose-500';
      default: return 'border-l-slate-300';
    }
  };

  const formatarTempoRelativo = (data?: string) => {
    if (!data) return 'Atualizado recentemente';
    const dataObj = new Date(data);
    const diffHoras = Math.floor((new Date().getTime() - dataObj.getTime()) / (1000 * 60 * 60));
    if (diffHoras < 1) return 'Há pouco';
    if (diffHoras < 24) return `Há ${diffHoras}h`;
    return `Há ${Math.floor(diffHoras / 24)}d`;
  };

  const renderModulosTags = (modulos?: string[]) => {
    const listaModulos = modulos && modulos.length > 0 ? modulos : ['Financeiro', 'Estoque', 'NFe']; 
    const mostrar = listaModulos.slice(0, 3);
    const restantes = listaModulos.length - 3;

    return (
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <Box size={14} className="text-slate-400 mr-1 hidden sm:block" />
        {mostrar.map((mod, idx) => (
          <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
            {mod}
          </span>
        ))}
        {restantes > 0 && (
          <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[11px] font-semibold">
            +{restantes}
          </span>
        )}
      </div>
    );
  };

  const STATUS_OPCOES = ['TODOS', 'RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'];

  return (
    <div className="p-4 md:p-8 h-[100dvh] flex flex-col bg-[#f4f7f9] animate-in fade-in duration-300 font-sans pb-24 md:pb-8 w-full overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Visualizando: {statusFiltro === 'TODOS' ? 'Todos' : statusFiltro}
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">{quotesList.length} registros encontrados</p>
        </div>
        
        <button 
          onClick={() => handleOpenNewQuote()}
          className="hidden md:flex bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold items-center gap-2 transition-all active:scale-95 shadow-sm text-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Novo Orçamento
        </button>
      </div>

      {/* RADAR DE CONVERSÃO (PRATELEIRA) COMPACTA */}
      <div className="mb-5 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-950" />
            Interessados
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full ml-1">
              {leadsAguardando.length}
            </span>
          </h3>
        </div>
        
        {leadsAguardando.length === 0 ? (
          <div className="bg-white/50 border border-slate-200 border-dashed rounded-lg p-4 text-center">
            <p className="text-slate-500 font-medium text-xs">Nenhum cliente aguardando orçamento no momento.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            {leadsAguardando.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => handleOpenNewQuote(lead)}
                className="snap-start min-w-[180px] w-[180px] sm:max-w-[220px] bg-emerald-50 border border-emerald-200 rounded-lg p-3 cursor-pointer hover:bg-emerald-100/60 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col gap-1.5 shrink-0"
              >
                <div className="flex items-start justify-between">
                  <h4 
                    className="font-bold text-emerald-950 text-xs truncate pr-2 group-hover:text-emerald-700 transition-colors"
                    title={lead.nome}
                  >
                    {lead.nome}
                  </h4>
                </div>
                
                {lead.cnpj && (
                  <p className="text-[10px] font-mono text-emerald-700/70 truncate">{lead.cnpj}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-semibold text-emerald-700 truncate">
                      {formatarTempoRelativo(lead.updatedAt)}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                    Orçar
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOOLBAR MINIMALISTA */}
      <div className="flex flex-col gap-4 mb-4 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {STATUS_OPCOES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFiltro(status)}
              className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                statusFiltro === status 
                  ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : status}
            </button>
          ))}
        </div>

        {/* Agrupamento responsivo para busca, data e botões */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm w-full">
            <Search size={18} className="text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
              placeholder="Buscar orçamento..." 
              className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder:text-slate-400 min-w-0"
            />
            {termo && (
              <button onClick={() => { setTermo(''); fetchQuotes(); }} className="text-slate-400 hover:text-rose-500 p-1 shrink-0">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm w-full sm:w-auto">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <input 
                type="date" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-700 w-full sm:w-auto"
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-700 w-full sm:w-auto"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => { fetchQuotes(); fetchLeadsAguardando(); }}
                className="flex-1 sm:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center min-w-[100px]"
              >
                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              {(termo || statusFiltro !== 'TODOS' || dataInicio || dataFim) && (
                <button 
                  onClick={limparFiltros}
                  className="bg-rose-50 text-rose-600 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center shrink-0"
                  title="Limpar Filtros"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto bg-white border-y border-slate-200 shadow-sm rounded-b-lg md:rounded-lg min-h-0">
        {isLoading && quotesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quotesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[200px]">
            <FileText size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Nada por aqui</h3>
            <p className="text-slate-500 text-sm mt-1">Ajuste os filtros ou crie um novo orçamento.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {quotesList.map((quote) => (
              <div 
                key={quote.id} 
                onClick={() => handleEditQuote(quote)}
                className={`group flex items-center justify-between bg-white border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors px-3 sm:px-4 py-3 border-l-4 ${getStatusBorderClass(quote.status)}`}
              >
                <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-500">#{String(quote.id).padStart(4, '0')}</span>
                    <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500">
                      {formatarTempoRelativo((quote as any).createdAt || (quote as any).updatedAt)}
                    </span>
                    <div className="hidden sm:block ml-2">{getStatusBadge(quote.status)}</div>
                  </div>

                  {/* Organização título x valor melhorada para mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm md:text-base truncate pr-2 sm:pr-3">
                      {quote.nomeCliente}
                    </h4>
                    <span className="font-black text-slate-900 text-sm md:text-base whitespace-nowrap mt-0.5 sm:mt-0">
                      {formatarMoeda(quote.valorNegociado || quote.valorBase)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 mt-0.5 sm:mt-0">
                    <span className="text-xs text-slate-500 truncate">
                      {quote.cnpj || 'Consumidor Final'}
                    </span>
                  </div>

                  {renderModulosTags((quote as any).modulos)}
                </div>

                <div className="flex items-center pl-1 sm:pl-2 border-l border-transparent md:group-hover:border-slate-200 transition-colors shrink-0">
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB Mobile */}
      <button 
        onClick={() => handleOpenNewQuote()}
        className="md:hidden fixed bottom-6 right-4 sm:right-6 w-14 h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30 active:scale-95 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <QuoteModal 
          quote={quoteEditando} 
          onClose={() => {
            setIsModalOpen(false);
            fetchQuotes(); 
            fetchLeadsAguardando();
          }} 
        />
      )}
    </div>
  );
}