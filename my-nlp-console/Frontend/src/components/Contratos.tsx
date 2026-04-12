import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { UploadCloud, Search, Phone, RefreshCw, Inbox, PlayCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { io } from 'socket.io-client'; 
import ProspectModal from './ContratosModal';

export interface Prospect {
  id: string;
  cnpj: string;
  nome: string;
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO';
  atendente?: string; 
  
  simplesNacional?: string;
  situacaoCadastral?: string;
  telefoneSecundario?: string;
  email?: string;
  atividadePrincipal?: string;
  telefoneBackup?: string;

  observacoes?: string;
  novosModulos?: string[] | string;
  
  atendidoPor?: string;
  dataAtendimento?: string | Date;
}

// CORREÇÃO AQUI: Alterado o fallback de localhost para a URL do Render
const BASE_URL = import.meta.env?.PUBLIC_API_URL || import.meta.env?.VITE_API_URL || 'https://core-nlp-support.onrender.com';

const API_URL = `${BASE_URL}/prospects`;
const SOCKET_URL = BASE_URL; 

const getCardStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-white border-transparent hover:border-blue-300 hover:shadow-sm hover:ring-1 hover:ring-blue-100 cursor-pointer';
    case 'EM_ATENDIMENTO': return 'bg-amber-50/40 border-amber-200 opacity-90 cursor-not-allowed';
    case 'APROVADO': return 'bg-emerald-50/40 border-emerald-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'REPROVADO': return 'bg-rose-50/40 border-rose-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    default: return 'bg-white border-transparent';
  }
};

const getBadgeStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'EM_ATENDIMENTO': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'APROVADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REPROVADO': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  data: Prospect[];
  emptyMessage: string;
  onCardClick: (prospect: Prospect) => void;
}

function PaginatedSection({ title, icon, data, emptyMessage, onCardClick }: SectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
          {data.length}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="bg-white/50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-slate-500 font-medium text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedData.map((prospect) => (
              <div 
                key={prospect.id} 
                onClick={() => onCardClick(prospect)}
                className={`flex flex-col p-5 rounded-xl border shadow-sm transition-all duration-200 ${getCardStyle(prospect.status)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(prospect.status)}`}>
                    {prospect.status.replace('_', ' ')}
                  </span>
                  {prospect.status === 'EM_ATENDIMENTO' && prospect.atendente && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <RefreshCw size={10} className="animate-spin" />
                      {prospect.atendente}
                    </span>
                  )}
                </div>
                <div className="mb-4 flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 line-clamp-2">
                    {prospect.nome}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 font-mono">
                    {prospect.cnpj}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100/80 mt-auto">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold">{prospect.telefone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 mt-4">
              <span className="text-xs text-slate-500 font-medium">
                Pág. <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages}</strong>
              </span>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-0.5 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-6 h-6 rounded-md text-[11px] font-bold transition-colors ${
                            currentPage === page 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-50 hover:border hover:border-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-slate-400 text-xs px-0.5">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProspectList() {
  const [prospects, setProspects] = useState<Prospect[]>([]); 
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('@CRM:token');
  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.id || '';

  const handleAuthError = (error: any) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@CRM:token');
      localStorage.removeItem('@CRM:user');
      window.location.reload();
      return true;
    }
    return false;
  };

  const fetchProspects = async () => {
    try {
      const response = await axios.get(`${API_URL}?t=${new Date().getTime()}`, {
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setProspects(response.data);
    } catch (error: any) {
      if (handleAuthError(error)) return; 
      console.error('Erro ao carregar prospects:', error);
    }
  };

  useEffect(() => {
    fetchProspects();

    const socket = io(SOCKET_URL);

    socket.on('prospectUpdated', (updatedProspect: Prospect) => {
      setProspects(prev => prev.map(p => 
        p.id === updatedProspect.id ? updatedProspect : p
      ));
    });

    socket.on('prospectsRefresh', () => {
      fetchProspects();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      if (lines[0].includes('Estabelecimentos')) lines.shift(); 
      const cleanCsv = lines.join('\n');

      Papa.parse(cleanCsv, {
        header: false, 
        skipEmptyLines: true,
        complete: async (results) => {
          const dataRows = results.data.slice(1);

          const novosProspects = dataRows
            .filter((row: any) => row[0]) 
            .map((row: any) => ({
              cnpj:               String(row[0] || '').trim(), 
              nome:               String(row[1] || 'Sem Nome').trim(), 
              simplesNacional:    String(row[8] || '').trim(), 
              situacaoCadastral:  String(row[16] || '').trim(), 
              telefone:           String(row[23] || 'Sem Telefone').trim(), 
              telefoneSecundario: String(row[24] || '').trim(), 
              email:              String(row[25] || '').trim(), 
              atividadePrincipal: String(row[37] || '').trim(), 
              telefoneBackup:     String(row[41] || '').trim(), 
              modulosAtuais:      String(row[42] || 'Nenhum').trim() 
            }));

          try {
            await axios.post(`${API_URL}/importar`, 
              { prospects: novosProspects },
              {
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                }
              }
            );
          } catch (apiError: any) {
            if (handleAuthError(apiError)) return;
            console.error('Erro na API:', apiError);
          } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      console.error('Falha ao processar CSV', error);
      setIsImporting(false);
    }
  };

  const handleCardClick = async (prospect: Prospect) => {
    if (prospect.status === 'EM_ATENDIMENTO') return; 
    if (prospect.status === 'APROVADO' || prospect.status === 'REPROVADO') {
      setSelectedProspect(prospect);
      setIsModalOpen(true);
      return;
    }
    if (prospect.status === 'PENDENTE') {
      try {
        const response = await axios.put(`${API_URL}/${prospect.id}/travar`, 
          { 
            userId: currentUserId,
            userName: currentUser?.nome 
          },
          {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const updatedProspect = response.data;
        setSelectedProspect(updatedProspect);
        setIsModalOpen(true);

      } catch (error: any) {
        if (handleAuthError(error)) return;
        
        if (error.response && error.response.status === 409) {
          alert('Este cliente já está sendo atendido por outro usuário.');
          return; 
        }
        
        console.error('Erro ao travar:', error);
      }
    }
  };

  const filteredProspects = prospects.filter(prospect => {
    const termo = searchQuery.toLowerCase();
    return prospect.nome.toLowerCase().includes(termo) || 
           prospect.cnpj.includes(termo) || 
           prospect.telefone.includes(termo);
  });

  const prospectsPendentes = filteredProspects.filter(p => p.status === 'PENDENTE');
  const prospectsEmAtendimento = filteredProspects.filter(p => p.status === 'EM_ATENDIMENTO');
  const prospectsAprovados = filteredProspects.filter(p => p.status === 'APROVADO');
  const prospectsReprovados = filteredProspects.filter(p => p.status === 'REPROVADO');

  return (
      <div className="p-8 bg-[#f4f5f7] h-screen overflow-y-auto font-sans pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fila de Prospecção</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie e inicie atendimentos com seus clientes B2B.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="w-full sm:w-auto">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <UploadCloud size={18} />
                {isImporting ? 'Enviando...' : 'Importar CSV'}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-slate-200 mb-8" />
        
        <PaginatedSection 
          title="Para Triagem" 
          icon={<Inbox size={20} className="text-blue-600" />}
          data={prospectsPendentes}
          emptyMessage="Não há nenhum cliente aguardando atendimento."
          onCardClick={handleCardClick}
        />

        <PaginatedSection 
          title="Em Atendimento" 
          icon={<PlayCircle size={20} className="text-amber-500" />}
          data={prospectsEmAtendimento}
          emptyMessage="Nenhum cliente está sendo atendido neste momento."
          onCardClick={handleCardClick}
        />

        <PaginatedSection 
          title="Interessados" 
          icon={<CheckCircle2 size={20} className="text-emerald-500" />}
          data={prospectsAprovados}
          emptyMessage="Nenhuma venda foi aprovada na sua busca."
          onCardClick={handleCardClick}
        />

        <PaginatedSection 
          title="Não Interessados" 
          icon={<XCircle size={20} className="text-rose-500" />}
          data={prospectsReprovados}
          emptyMessage="Nenhum cliente foi reprovado na sua busca."
          onCardClick={handleCardClick}
        />

      </div>

       {isModalOpen && selectedProspect && (
        <ProspectModal 
          prospect={selectedProspect} 
          onClose={() => setIsModalOpen(false)} 
          currentUserId={currentUserId}
          currentUserName={currentUser?.nome || 'Usuário'} 
        />
      )}
    </div>
  );
}