import React, { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import QuoteModal from './QuoteModal';
import type { IQuote } from './types';

export default function QuotesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteEditando, setQuoteEditando] = useState<IQuote | null>(null);

  // Aqui no futuro você fará o fetch (GET) dos orçamentos do seu backend
  const quotesList: IQuote[] = []; 

  const handleOpenNewQuote = () => {
    setQuoteEditando(null); // Limpa qualquer dado para abrir um modal vazio
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-300">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orçamentos</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gerencie propostas e negociações comerciais.</p>
        </div>
        
        <button 
          onClick={handleOpenNewQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* Conteúdo Principal (Lista ou Empty State) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Barra de Busca (Opcional para o futuro) */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar orçamento por cliente ou CNPJ..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
            />
          </div>
        </div>

        {/* Empty State (Mostra isso quando não tem nada cadastrado) */}
        {quotesList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum orçamento encontrado</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2 leading-relaxed">
              Você ainda não possui orçamentos ou propostas registradas. Clique no botão acima para iniciar sua primeira negociação.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            {/* Aqui vai entrar a sua tabela de orçamentos no futuro */}
            <p className="text-slate-400 text-sm">Tabela em construção...</p>
          </div>
        )}
      </div>

      {/* Modal renderizado condicionalmente */}
      {isModalOpen && (
        <QuoteModal 
          quote={quoteEditando} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      
    </div>
  );
}