import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Filter, X, Calendar } from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';

export default function QuotesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteEditando, setQuoteEditando] = useState<IQuote | null>(null);

  // --- Estados de Filtro ---
  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // --- Estados de Dados ---
  const [quotesList, setQuotesList] = useState<IQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar dados no backend (Integração com o QuoteController.consultar)
  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      // Ajuste a URL base da sua API conforme necessário
      const queryParams = new URLSearchParams();
      if (termo) queryParams.append('termo', termo);
      if (statusFiltro !== 'TODOS') queryParams.append('status', statusFiltro);
      if (dataInicio) queryParams.append('dataInicio', dataInicio);
      if (dataFim) queryParams.append('dataFim', dataFim);

      // Exemplo: const response = await api.get(`/quotes/consultar?${queryParams.toString()}`);
      // const data = response.data;
      // setQuotesList(data);
      
      console.log("Buscando com filtros:", queryParams.toString());
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca inicial
  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleOpenNewQuote = () => {
    setQuoteEditando(null);
    setIsModalOpen(true);
  };

  const limparFiltros = () => {
    setTermo('');
    setStatusFiltro('TODOS');
    setDataInicio('');
    setDataFim('');
    // O fetchQuotes precisaria ser chamado aqui novamente sem parâmetros, 
    // ou você pode colocar um useEffect escutando essas mudanças.
  };

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-300">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orçamentos</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gerencie propostas e negociações comerciais.</p>
        </div>
        
        <button 
          onClick={handleOpenNewQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* Container Principal */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Painel de Filtros */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
          
          {/* Barra de Busca Principal */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar por ID, cliente, CNPJ ou endereço..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
              />
            </div>
            <button 
              onClick={fetchQuotes}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Pesquisar
            </button>
          </div>

          {/* Filtros Secundários */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none font-medium cursor-pointer"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="RASCUNHO">Rascunho</option>
                <option value="ENVIADO">Enviado</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REPROVADO">Reprovado</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Calendar size={16} className="text-slate-400" />
              <input 
                type="date" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none"
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            {(termo || statusFiltro !== 'TODOS' || dataInicio || dataFim) && (
              <button 
                onClick={limparFiltros}
                className="flex items-center gap-1 text-sm font-medium text-rose-500 hover:text-rose-600 px-2 py-1 ml-auto"
              >
                <X size={16} /> Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Área de Listagem / Empty State */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quotesList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum orçamento encontrado</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2 leading-relaxed">
              Não encontramos nenhum registro com os filtros aplicados ou sua base está vazia.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <p className="text-slate-400 text-sm">Tabela em construção...</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <QuoteModal 
          quote={quoteEditando} 
          onClose={() => {
            setIsModalOpen(false);
            fetchQuotes(); // Atualiza a lista quando fechar o modal
          }} 
        />
      )}
      
    </div>
  );
}