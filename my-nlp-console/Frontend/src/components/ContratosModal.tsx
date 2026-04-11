import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Search, Phone, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
// import ProspectModal from './ContratosModal'; // Descomente quando for plugar o modal

export interface Prospect {
  id: string;
  cnpj: string;
  nome: string;
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO';
  atendente?: string; // Novo campo opcional para mostrar quem está atendendo
}

const API_URL = 'http://localhost:3000/prospects';

// ==========================================
// DADOS DE TESTE (Para você visualizar o layout)
// ==========================================
const MOCK_DATA: Prospect[] = [
  { id: '1', cnpj: '00.000.000/0001-01', nome: 'Empresa Alpha Ltda', telefone: '(11) 99999-9999', modulosAtuais: 'Nenhum', status: 'PENDENTE' },
  { id: '2', cnpj: '11.111.111/0001-11', nome: 'Bazar Beta & Cia', telefone: '(11) 88888-8888', modulosAtuais: 'NFE', status: 'EM_ATENDIMENTO', atendente: 'Raoan' },
  { id: '3', cnpj: '22.222.222/0001-22', nome: 'Fagundes & Cia Ltda', telefone: '(41) 3667-4743', modulosAtuais: 'Nenhum', status: 'PENDENTE' },
  { id: '4', cnpj: '33.333.333/0001-33', nome: 'Guedes e Licheski Ltda', telefone: '(41) 3282-5643', modulosAtuais: 'NFCE', status: 'APROVADO' },
  { id: '5', cnpj: '44.444.444/0001-44', nome: 'TG Industria de Lubrificantes', telefone: '(41) 3014-4056', modulosAtuais: 'Nenhum', status: 'REPROVADO' },
  { id: '6', cnpj: '55.555.555/0001-55', nome: 'Lumi Light Comunicação', telefone: 'Sem Telefone', modulosAtuais: 'Nenhum', status: 'PENDENTE' },
  { id: '7', cnpj: '66.666.666/0001-66', nome: 'Fernando Luiz Aguiar', telefone: 'Sem Telefone', modulosAtuais: 'Nenhum', status: 'EM_ATENDIMENTO', atendente: 'João' },
];

export default function ProspectList() {
  // Estados principais
  const [prospects, setProspects] = useState<Prospect[]>(MOCK_DATA); // ⚠️ Troque MOCK_DATA por [] quando ligar na API
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados de Filtro e Paginação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Quantidade de cards por página

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = "user-123"; 

  // ==========================================
  // LÓGICA DE FILTROS E PESQUISA (Client-side)
  // ==========================================
  const filteredProspects = prospects.filter(prospect => {
    // Filtro de Texto (Nome, CNPJ ou Telefone)
    const termo = searchQuery.toLowerCase();
    const matchBusca = 
      prospect.nome.toLowerCase().includes(termo) || 
      prospect.cnpj.includes(termo) || 
      prospect.telefone.includes(termo);

    // Filtro de Status
    const matchStatus = 
      statusFilter === 'TODOS' ? true :
      statusFilter === 'FINALIZADOS' ? (prospect.status === 'APROVADO' || prospect.status === 'REPROVADO') :
      prospect.status === statusFilter;

    return matchBusca && matchStatus;
  });

  // ==========================================
  // LÓGICA DE PAGINAÇÃO
  // ==========================================
  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProspects = filteredProspects.slice(startIndex, startIndex + itemsPerPage);

  // Reseta a página para 1 sempre que o usuário digitar na busca ou mudar o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ==========================================
  // INTEGRAÇÃO COM BACKEND (Deixado comentado para você reativar)
  // ==========================================
  /*
  const fetchProspects = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => { fetchProspects(); }, []);
  */

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... Mantenha sua lógica de PapaParse aqui exatamente como estava no código anterior
    alert("Função de importar mantida do seu código original!");
  };

  // ==========================================
  // CLIQUE NO CARD (Dar Lock)
  // ==========================================
  const handleCardClick = async (prospect: Prospect) => {
    if (prospect.status !== 'PENDENTE') {
      alert(`Este cliente já está ${prospect.status.replace('_', ' ').toLowerCase()}.`);
      return;
    }

    // Lógica visual simulada (Substitua pelo seu fetch /:id/travar)
    setProspects(prev => prev.map(p => 
      p.id === prospect.id ? { ...p, status: 'EM_ATENDIMENTO', atendente: 'Você' } : p
    ));
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  // ==========================================
  // RENDERIZAÇÃO DO LAYOUT DO CARD
  // ==========================================
  const getCardStyle = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-white border-l-gray-200 hover:shadow-md hover:-translate-y-0.5';
      case 'EM_ATENDIMENTO': return 'bg-yellow-50 border-l-yellow-400 opacity-90 cursor-not-allowed';
      case 'APROVADO': return 'bg-green-50 border-l-green-500 opacity-80 cursor-default';
      case 'REPROVADO': return 'bg-red-50 border-l-red-500 opacity-80 cursor-default';
      default: return 'bg-white border-l-gray-200';
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-gray-100 text-gray-600';
      case 'EM_ATENDIMENTO': return 'bg-yellow-200 text-yellow-800 animate-pulse';
      case 'APROVADO': return 'bg-green-200 text-green-800';
      case 'REPROVADO': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      
      {/* ================= TOP BAR ================= */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fila de Prospecção</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie e inicie atendimentos com seus clientes B2B.</p>
          </div>
          
          <div>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <UploadCloud size={20} />
              {isImporting ? 'Enviando...' : 'Importar CSV'}
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
          
          {/* Busca Unificada */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CNPJ ou Telefone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro de Status */}
          <div className="w-64">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes (Livres)</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="FINALIZADOS">Finalizados</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= GRID DE CARDS ================= */}
      {paginatedProspects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <p className="text-gray-500 font-medium">Nenhum cliente encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedProspects.map((prospect) => (
            <div 
              key={prospect.id} 
              onClick={() => handleCardClick(prospect)}
              className={`flex flex-col p-5 rounded-r-xl border-l-4 border-y border-r border-y-gray-200 border-r-gray-200 shadow-sm transition-all duration-200 ${getCardStyle(prospect.status)}`}
            >
              
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getBadgeStyle(prospect.status)}`}>
                  {prospect.status.replace('_', ' ')}
                </span>
                
                {/* Indicador de quem está atendendo */}
                {prospect.status === 'EM_ATENDIMENTO' && prospect.atendente && (
                  <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    <RefreshCw size={12} className="animate-spin" />
                    {prospect.atendente}
                  </span>
                )}
              </div>

              {/* Corpo do Card */}
              <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                  {prospect.nome}
                </h3>
                <p className="text-sm font-medium text-gray-500 font-mono">
                  {prospect.cnpj}
                </p>
              </div>

              {/* Footer do Card */}
              <div className="flex justify-between items-center pt-3 border-t border-black/5 mt-auto">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Phone size={14} />
                  <span className="text-sm font-semibold">{prospect.telefone}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINAÇÃO ================= */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <strong className="text-gray-900">{startIndex + 1}</strong> até <strong className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredProspects.length)}</strong> de <strong className="text-gray-900">{filteredProspects.length}</strong> clientes
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                // Mostra no máximo 5 botões de página para não quebrar o layout
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-400 text-sm">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL PLACEHOLDER */}
      {/* {isModalOpen && selectedProspect && (
        <ProspectModal ... />
      )} */}

    </div>
  );
}