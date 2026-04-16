import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Filter, 
  X, 
  Calendar, 
  RefreshCw, 
  ChevronRight,
  UserPlus,
  Box,
  Clock
} from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';
import { api } from '../../services/api';
import { formatarMoeda } from '../ProspectModal/prospectUtils';


const LEADS_AGUARDANDO_MOCK = [
  { id: 1, nome: 'TechCorp Solutions', tempo: 'Há 2h' },
  { id: 2, nome: 'Padaria Central', tempo: 'Há 5h' },
  { id: 3, nome: 'Lojas Silva', tempo: 'Ontem' },
  { id: 4, nome: 'Mecânica AutoTech', tempo: 'Ontem' },
];

export default function QuotesPage() {
  // ==========================================
  // ESTADOS E LÓGICA
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteEditando, setQuoteEditando] = useState<IQuote | null>(null);

  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const [quotesList, setQuotesList] = useState<IQuote[]>([]);
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

  useEffect(() => {
    fetchQuotes();
  }, [statusFiltro, dataInicio, dataFim]);

  const handleOpenNewQuote = (leadData: any = null) => {
    // Se leadData for passado (vindo do Radar), você pode injetar no modal aqui
    setQuoteEditando(null);
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

  // ==========================================
  // HELPERS DE APRESENTAÇÃO
  // ==========================================

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      APROVADO: "bg-emerald-50 text-emerald-700",
      ENVIADO: "bg-blue-50 text-blue-700",
      REPROVADO: "bg-rose-50 text-rose-700",
      RASCUNHO: "bg-slate-100 text-slate-600"
    };
    const cls = configs[status] || configs.RASCUNHO;
    return (
      <span className={`${cls} px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest`}>
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
    if (diffHoras < 1) return 'Atualizado há pouco';
    if (diffHoras < 24) return `Atualizado há ${diffHoras}h`;
    return `Atualizado há ${Math.floor(diffHoras / 24)}d`;
  };

  // Renderiza as tags dos módulos de forma limpa.
  // Assumindo que você terá um array de strings no seu IQuote (ex: quote.modulos)
  const renderModulosTags = (modulos?: string[]) => {
    // Array mockado como fallback para você ver o efeito visual caso não tenha dados reais ainda
    const listaModulos = modulos && modulos.length > 0 ? modulos : ['Financeiro', 'Estoque', 'NFe']; 
    
    // Mostra no máximo 3 módulos para não quebrar o layout, o resto agrupa
    const mostrar = listaModulos.slice(0, 3);
    const restantes = listaModulos.length - 3;

    return (
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <Box size={14} className="text-slate-400 mr-1" />
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
    <div className="p-4 md:p-8 h-screen flex flex-col bg-[#f4f7f9] animate-in fade-in duration-300 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Visualizando: {statusFiltro === 'TODOS' ? 'Todos os Orçamentos' : statusFiltro}
          </h1>
          <p className="text-slate-500 text-base mt-2">{quotesList.length} registros encontrados</p>
        </div>
        
        <button 
          onClick={() => handleOpenNewQuote()}
          className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold items-center gap-2 transition-all active:scale-95 shadow-sm text-base"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* RADAR DE CONVERSÃO (PRATELEIRA) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <UserPlus size={16} className="text-blue-500" />
            Aguardando Orçamento
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {LEADS_AGUARDANDO_MOCK.map((lead) => (
            <div 
              key={lead.id}
              onClick={() => handleOpenNewQuote(lead)}
              className="min-w-[200px] bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-slate-800 text-sm truncate pr-2 group-hover:text-blue-600 transition-colors">
                  {lead.nome}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 mt-auto">
                <Clock size={12} className="text-amber-500" />
                <span className="text-[11px] font-semibold text-amber-600">{lead.tempo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOOLBAR MINIMALISTA */}
      <div className="flex flex-col gap-5 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {STATUS_OPCOES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFiltro(status)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                statusFiltro === status 
                  ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : status}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
            <Search size={20} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
              placeholder="Buscar orçamento..." 
              className="bg-transparent border-none outline-none w-full text-base text-slate-800 placeholder:text-slate-400"
            />
            {termo && (
              <button onClick={() => { setTermo(''); fetchQuotes(); }} className="text-slate-400 hover:text-rose-500 p-1">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-transparent text-sm md:text-base outline-none text-slate-700"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-transparent text-sm md:text-base outline-none text-slate-700"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchQuotes}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg text-base font-bold shadow-sm transition-colors flex items-center justify-center min-w-[120px]"
            >
              <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            {(termo || statusFiltro !== 'TODOS' || dataInicio || dataFim) && (
              <button 
                onClick={limparFiltros}
                className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                title="Limpar Filtros"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-auto bg-white border-y border-slate-200 shadow-sm">
        {isLoading && quotesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quotesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center h-full">
            <FileText size={56} className="text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-800">Nada por aqui</h3>
            <p className="text-slate-500 text-base mt-2">Ajuste os filtros ou crie um novo orçamento.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {quotesList.map((quote) => (
              <div 
                key={quote.id} 
                onClick={() => handleEditQuote(quote)}
                className={`group flex items-center justify-between bg-white border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors px-5 py-4 border-l-4 ${getStatusBorderClass(quote.status)}`}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-500">#{String(quote.id).padStart(4, '0')}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {formatarTempoRelativo((quote as any).createdAt || (quote as any).updatedAt)}
                    </span>
                    <div className="hidden md:block ml-3">{getStatusBadge(quote.status)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base md:text-lg truncate pr-4">
                      {quote.nomeCliente}
                    </h4>
                    <span className="font-black text-slate-900 text-base md:text-lg whitespace-nowrap">
                      {formatarMoeda(quote.valorNegociado || quote.valorBase)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-sm text-slate-500 truncate">
                      {quote.cnpj || 'Consumidor Final'}
                    </span>
                    
                    {/* Exibindo os INTERESSES do Lead caso existam */}
                    {quote.interesses && (
                      <div className="flex items-center">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5 truncate max-w-full">
                          🎯 Interesse: {quote.interesses}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* NOVAS TAGS DOS MÓDULOS */}
                  {/* Passe a propriedade correta do seu IQuote aqui, ex: quote.modulosSelecionados */}
                  {renderModulosTags((quote as any).modulos)}
                </div>

                <div className="flex items-center pl-3 border-l border-transparent md:group-hover:border-slate-200 transition-colors">
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={() => handleOpenNewQuote()}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {isModalOpen && (
        <QuoteModal 
          quote={quoteEditando} 
          onClose={() => {
            setIsModalOpen(false);
            fetchQuotes(); 
          }} 
        />
      )}
    </div>
  );
}