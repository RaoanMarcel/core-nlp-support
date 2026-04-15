import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Filter, 
  X, 
  Calendar, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';
import { api } from '../../services/api';
import { formatarMoeda } from '../ProspectModal/prospectUtils';

export default function QuotesPage() {
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteEditando, setQuoteEditando] = useState<IQuote | null>(null);

  // Estados dos Filtros
  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Estados de Dados e UI
  const [quotesList, setQuotesList] = useState<IQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para as cores do Status
  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      APROVADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
      ENVIADO: "bg-blue-100 text-blue-700 border-blue-200",
      REPROVADO: "bg-rose-100 text-rose-700 border-rose-200",
      RASCUNHO: "bg-slate-100 text-slate-600 border-slate-200"
    };
    const cls = configs[status] || configs.RASCUNHO;
    return (
      <span className={`${cls} px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border`}>
        {status.toLowerCase()}
      </span>
    );
  };

  // FUNÇÃO PRINCIPAL DE BUSCA
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

  // Dispara busca automática apenas quando mudar Status ou Datas
  useEffect(() => {
    fetchQuotes();
  }, [statusFiltro, dataInicio, dataFim]);

  const handleOpenNewQuote = () => {
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

  return (
    <div className="p-8 h-screen flex flex-col bg-slate-50/30 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orçamentos</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gerencie propostas e negociações comerciais.</p>
        </div>
        
        <button 
          onClick={handleOpenNewQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Barra de Filtros */}
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Campo de Busca Texto */}
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
                  placeholder="Buscar por cliente, CNPJ ou ID..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button 
                onClick={fetchQuotes}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Pesquisar
              </button>
            </div>

            {/* Outros Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none font-bold cursor-pointer min-w-[120px]"
                >
                  <option value="TODOS">Todos Status</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="REPROVADO">Reprovado</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Calendar size={16} className="text-slate-400" />
                <input 
                  type="date" 
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none text-slate-600"
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="date" 
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none text-slate-600"
                />
              </div>

              <button 
                onClick={fetchQuotes}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Botão Limpar (aparece se houver filtro ativo) */}
          {(termo || statusFiltro !== 'TODOS' || dataInicio || dataFim) && (
            <div className="flex justify-end">
              <button 
                onClick={limparFiltros}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={14} /> LIMPAR FILTROS
              </button>
            </div>
          )}
        </div>

        {/* Listagem / Tabela */}
        <div className="flex-1 overflow-auto relative">
          {isLoading && quotesList.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : quotesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <FileText size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Nenhum orçamento encontrado</h3>
              <p className="text-slate-500 text-sm max-w-xs mt-2">
                Não encontramos registros com os filtros aplicados ou sua base está vazia.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 sticky top-0 backdrop-blur-md z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Empresa</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Valor Final</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {quotesList.map((quote) => (
                  <tr key={quote.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        #{String(quote.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{quote.nomeCliente}</span>
                        <span className="text-[11px] font-medium text-slate-400">{quote.cnpj || 'Sem CNPJ'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-slate-900">
                        {formatarMoeda(quote.valorNegociado || quote.valorBase)}
                      </span>
                    </td>
                    <td className="px-6 py-5">{getStatusBadge(quote.status)}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleEditQuote(quote)}
                        className="px-4 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg transition-all"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé da Tabela */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            TOTAL DE {quotesList.length} ORÇAMENTOS ENCONTRADOS
          </p>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
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