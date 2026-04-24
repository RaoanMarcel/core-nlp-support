import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, X, Calendar, RefreshCw, ChevronRight, Box, Clock, CheckCircle2 } from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';
import { api } from '../../services/api';
import { formatarMoeda } from '../../utils/utils';
import { useCan } from '../../hooks/useCan';

export default function QuotesPage() {
  const navigate = useNavigate(); 
  const { can } = useCan();

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

  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  
  const canCreateQuote = can('quotes:create');

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ajustado para a rota padrão. Se o seu backend exige um caminho específico, ajuste aqui.
      const response = await api.get('/quotes', {
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

  const handleCreateDraftFromLead = (lead: any) => {
    if (!canCreateQuote) {
      alert('Acesso Negado: Você não tem permissão para criar ou orçar novos clientes.');
      return;
    }

    // Cria um objeto parcial apenas com os dados que já temos do lead.
    // Como não tem 'id', o QuoteModal vai entender que é um NOVO orçamento.
    const preFilledQuote = {
      nomeCliente: lead.nome || '',
      cnpj: lead.cnpj || '',
      email: lead.email || '',
      telefonePrincipal: lead.telefone || '',
      telefoneSecundario: lead.telefoneSecundario || '',
      cep: lead.cep || '',
      logradouro: lead.endereco || '',
      bairro: lead.bairro || '',
      cidade: lead.cidade || '',
      uf: lead.estado || '',
      observacoes: lead.observacoes || '',
      status: 'RASCUNHO',
      usuarioLogin: currentUser?.nome || 'Sistema',
      valorBase: 0,
      valorNegociado: 0
    };

    setQuoteEditando(preFilledQuote as unknown as IQuote);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchQuotes();
    fetchLeadsAguardando();
  }, [statusFiltro, dataInicio, dataFim]);  

  const handleOpenNewQuote = () => {
    if (!canCreateQuote) {
      alert('Acesso Negado: Você não tem permissão para criar ou orçar novos clientes.');
      return;
    }

    setQuoteEditando(null);
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
      APROVADO: "bg-emerald-500/10 text-emerald-600",
      ENVIADO: "bg-blue-500/10 text-blue-600",
      REPROVADO: "bg-rose-500/10 text-rose-600",
      RASCUNHO: "bg-theme-base text-theme-muted border border-theme-border"
    };
    const cls = configs[status] || configs.RASCUNHO;
    return (
      <span className={`${cls} px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap`}>
        {status.toLowerCase()}
      </span>
    );
  };

  const getStatusBorderClass = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'border-l-emerald-500';
      case 'ENVIADO': return 'border-l-blue-500';
      case 'REPROVADO': return 'border-l-rose-500';
      default: return 'border-l-theme-border';
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
        <Box size={14} className="text-theme-muted mr-1 hidden sm:block transition-colors" />
        {mostrar.map((mod, idx) => (
          <span key={idx} className="bg-theme-base border border-theme-border text-theme-muted px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition-colors">
            {mod}
          </span>
        ))}
        {restantes > 0 && (
          <span className="bg-theme-base border border-theme-border text-theme-muted px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition-colors">
            +{restantes}
          </span>
        )}
      </div>
    );
  };

  const STATUS_OPCOES = ['TODOS', 'RASCUNHO', 'ENVIADO', 'APROVADO', 'REPROVADO'];

  return (
    <>
      <div className="p-4 md:p-8 h-dvh flex flex-col bg-theme-base animate-in fade-in duration-300 font-sans pb-24 md:pb-8 w-full overflow-hidden transition-colors">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl font-black text-theme-text tracking-tight transition-colors line-clamp-1">
              Visualizando: {statusFiltro === 'TODOS' ? 'TODOS' : statusFiltro}
            </h1>
            <p className="text-theme-muted text-sm md:text-base mt-1 transition-colors">{quotesList.length} registros encontrados</p>
          </div>
          
          {canCreateQuote && (
            <button 
              onClick={() => handleOpenNewQuote()}
              className="w-full sm:w-auto flex justify-center bg-theme-accent hover:opacity-90 text-white px-5 py-3 sm:py-2.5 rounded-shape-lg font-bold items-center gap-2 transition-all active:scale-95 shadow-sm text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Novo Orçamento
            </button>
          )}
        </div>

        {/* RADAR DE CONVERSÃO */}
        <div className="mb-5 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2 transition-colors">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Interessados
              <span className="bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                {leadsAguardando.length}
              </span>
            </h3>
          </div>
          
          {leadsAguardando.length === 0 ? (
            <div className="bg-theme-panel/50 border border-theme-border border-dashed rounded-shape-lg p-4 text-center transition-colors">
              <p className="text-theme-muted font-medium text-xs">Nenhum cliente aguardando orçamento no momento.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
              {leadsAguardando.map((lead) => (
                <div 
                  key={lead.id}
                  onClick={() => handleCreateDraftFromLead(lead)}
                  className="snap-start w-50 sm:w-60 bg-emerald-500/5 border border-emerald-500/20 rounded-shape-lg p-3 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-md transition-all group flex flex-col gap-1.5 shrink-0"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-emerald-600 text-sm truncate pr-2 group-hover:text-emerald-500 transition-colors" title={lead.nome}>
                      {lead.nome}
                    </h4>
                  </div>
                  {lead.cnpj && (
                    <p className="text-[11px] font-mono text-emerald-600/70 truncate">{lead.cnpj}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-emerald-600/90 truncate">
                        {formatarTempoRelativo(lead.updatedAt)}
                      </span>
                    </div>
                    {canCreateQuote && (
                      <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-700 px-2 py-1 rounded shrink-0">
                        Orçar
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 mb-4 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {STATUS_OPCOES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFiltro(status)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  statusFiltro === status 
                    ? 'bg-theme-text border-theme-text text-theme-base shadow-sm' 
                    : 'bg-theme-panel border-theme-border text-theme-text hover:bg-theme-base'
                }`}
              >
                {status === 'TODOS' ? 'TODOS' : status}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center bg-theme-panel border border-theme-border rounded-shape-lg px-3 py-2.5 focus-within:border-theme-accent focus-within:ring-1 focus-within:ring-theme-accent transition-all shadow-sm w-full">
              <Search size={18} className="text-theme-muted mr-2 shrink-0 transition-colors" />
              <input 
                type="text" 
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
                placeholder="Buscar orçamento..." 
                className="bg-transparent border-none outline-none w-full text-sm text-theme-text placeholder:text-theme-muted min-w-0 transition-colors"
              />
              {termo && (
                <button onClick={() => { setTermo(''); fetchQuotes(); }} className="text-theme-muted hover:text-rose-500 p-1 shrink-0 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <div className="flex flex-row items-center gap-2 bg-theme-panel border border-theme-border rounded-shape-lg px-3 py-2.5 shadow-sm w-full sm:w-auto transition-colors">
                <Calendar size={16} className="text-theme-muted shrink-0 hidden sm:block transition-colors" />
                <input 
                  type="date" 
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-transparent text-sm outline-none text-theme-text w-full sm:w-auto transition-colors flex-1"
                  style={{ colorScheme: 'var(--color-scheme, light)' }}
                />
                <span className="text-theme-border font-bold transition-colors">-</span>
                <input 
                  type="date" 
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-transparent text-sm outline-none text-theme-text w-full sm:w-auto transition-colors flex-1"
                  style={{ colorScheme: 'var(--color-scheme, light)' }}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => { fetchQuotes(); fetchLeadsAguardando(); }}
                  className="flex-1 sm:flex-none bg-theme-panel border border-theme-border hover:bg-theme-base text-theme-text px-4 py-2.5 rounded-shape-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center min-w-25"
                >
                  <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
                {(termo || statusFiltro !== 'TODOS' || dataInicio || dataFim) && (
                  <button 
                    onClick={limparFiltros}
                    className="bg-rose-500/10 text-rose-500 px-3 py-2.5 rounded-shape-lg text-sm font-bold transition-colors flex items-center justify-center shrink-0"
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
        <div className="flex-1 overflow-y-auto bg-theme-panel border border-theme-border shadow-sm rounded-shape-lg min-h-0 transition-colors custom-scrollbar">
          {isLoading && quotesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-60">
              <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : quotesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-60">
              <FileText size={48} className="text-theme-muted/50 mb-4 transition-colors" />
              <h3 className="text-lg font-bold text-theme-text transition-colors">Nada por aqui</h3>
              <p className="text-theme-muted text-sm mt-1 transition-colors">Ajuste os filtros ou crie um novo orçamento.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {quotesList.map((quote) => (
                <div 
                  key={quote.id} 
                  onClick={() => navigate(`/orcamentos/${quote.id}`)} 
                  className={`group flex items-center justify-between bg-theme-panel border-b border-theme-border hover:bg-theme-base cursor-pointer transition-colors px-3 sm:px-5 py-4 border-l-4 ${getStatusBorderClass(quote.status)}`}
                >
                  <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-theme-muted transition-colors">#{String(quote.id).padStart(4, '0')}</span>
                      <span className="text-xs text-theme-border hidden sm:inline transition-colors">•</span>
                      <span className="text-[11px] sm:text-[12px] text-theme-muted transition-colors">
                        {formatarTempoRelativo((quote as any).createdAt || (quote as any).updatedAt)}
                      </span>
                      <div className="hidden sm:block ml-2">{getStatusBadge(quote.status)}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <h4 className="font-bold text-theme-text text-base md:text-lg truncate pr-2 sm:pr-3 transition-colors">
                        {quote.nomeCliente}
                      </h4>
                      <span className="font-black text-theme-text text-sm sm:text-base whitespace-nowrap mt-1 sm:mt-0 transition-colors">
                        {formatarMoeda(quote.valorNegociado || quote.valorBase)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 sm:mt-0">
                      <span className="text-xs text-theme-muted truncate transition-colors">
                        {quote.cnpj || 'Consumidor Final'}
                      </span>
                      <div className="block sm:hidden shrink-0 ml-2">
                        {getStatusBadge(quote.status)}
                      </div>
                    </div>

                    {renderModulosTags((quote as any).modulos)}
                  </div>

                  <div className="flex items-center pl-2 sm:pl-4 border-l border-transparent md:group-hover:border-theme-border transition-colors shrink-0">
                    <ChevronRight size={20} className="text-theme-muted group-hover:text-theme-accent transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}