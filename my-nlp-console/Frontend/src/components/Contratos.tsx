import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, Search, Phone, RefreshCw, Inbox, PlayCircle, 
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, Target, 
  Clock, ChevronDown, ChevronUp, MapPin
} from 'lucide-react';
import { io } from 'socket.io-client'; 
import ProspectModal from './ProspectModal/index';
import { api } from '../services/api';

export interface Prospect {
  id: string;
  cnpj: string;
  nome: string; 
  nomeFantasia?: string; 
  endereco?: string;
  bairro?: string;   
  cidade?: string;   
  estado?: string;   
  cep?: string;      
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO' | 'POSSIBILIDADE' | 'RETORNAR';
  lockedBy?: string;
  
  simplesNacional?: string;
  situacaoCadastral?: string;
  telefoneSecundario?: string;
  email?: string;
  atividadePrincipal?: string;
  telefoneBackup?: string;

  observacoes?: string;
  novosModulos?: string[] | string;
  clienteWLE?: boolean; 
  
  atendidoPor?: string;
  dataAtendimento?: string | Date;
  valor?: number | null; 
  updatedAt?: string; 
}

const SOCKET_URL = import.meta.env?.VITE_API_URL || 'https://core-nlp-support.onrender.com';

const getCardStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-white border-transparent hover:border-blue-300 hover:shadow-sm hover:ring-1 hover:ring-blue-100 cursor-pointer';
    case 'EM_ATENDIMENTO': return 'bg-amber-50/40 border-amber-200 opacity-90 cursor-not-allowed';
    case 'RETORNAR': return 'bg-purple-50/40 border-purple-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'POSSIBILIDADE': return 'bg-blue-50/40 border-blue-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'APROVADO': return 'bg-emerald-50/40 border-emerald-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'REPROVADO': return 'bg-rose-50/40 border-rose-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    default: return 'bg-white border-transparent';
  }
};

const getBadgeStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'EM_ATENDIMENTO': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'RETORNAR': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'POSSIBILIDADE': return 'bg-blue-50 text-blue-700 border-blue-200';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const itemsPerPage = 6; 

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="mb-8 bg-white/40 p-2 rounded-2xl border border-transparent hover:border-slate-200 transition-colors">
      <div 
        className="flex items-center justify-between p-2 cursor-pointer rounded-xl hover:bg-slate-100/80 transition-all select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
            {data.length}
          </span>
        </div>
        
        <div className="text-slate-400 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 px-2 pb-2 animate-in fade-in duration-300">
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
                      {prospect.status === 'EM_ATENDIMENTO' && prospect.lockedBy && (
                        <span 
                          className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded max-w-30"
                          title={`Sendo atendido por: ${prospect.lockedBy}`}
                        >
                          <RefreshCw size={10} className="animate-spin shrink-0" />
                          <span className="truncate">{prospect.lockedBy}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4 flex-1">
                      <h3 className="text-base font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1" title={prospect.nome}>
                        {prospect.nome}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2 mt-2">
                        <p className="text-xs font-medium text-slate-500 font-mono">
                          {prospect.cnpj}
                        </p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          prospect.clienteWLE 
                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          WLE: {prospect.clienteWLE ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      
                      {prospect.bairro && (
                        <div className="flex items-center gap-1 mt-2 text-slate-500">
                          <MapPin size={12} />
                          <span className="text-[11px] font-medium truncate">{prospect.bairro}</span>
                        </div>
                      )}
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
  const [filtroWLE, setFiltroWLE] = useState(false); 
  
  // ESTADOS DO COMBOBOX (SEARCHABLE DROPDOWN)
  const [filtroBairro, setFiltroBairro] = useState('TODOS'); 
  const [bairroSearchTerm, setBairroSearchTerm] = useState('');
  const [isBairroDropdownOpen, setIsBairroDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.id || '';

  const bairrosDisponiveis = Array.from(new Set(prospects.map(p => p.bairro).filter(Boolean))).sort();

  // Fecha o dropdown se o usuário clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBairroDropdownOpen(false);
        // Se fechou sem escolher nada e o texto tá vazio, volta pro filtro TODOS
        if (bairroSearchTerm.trim() === '') {
          setFiltroBairro('TODOS');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bairroSearchTerm]);

  // Filtra as opções do dropdown com base no que o usuário digitou
  const filteredBairrosDropdown = bairrosDisponiveis.filter(b => 
    (b as string).toLowerCase().includes(bairroSearchTerm.toLowerCase())
  );

  const handleUpdateProspect = (updated: Prospect) => {
    setProspects(prev => {
      const novaLista = prev.map(p => p.id === updated.id ? updated : p);
      return novaLista.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    });
    setSelectedProspect(updated);
  };

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
      const response = await api.get('/prospects', {
        params: { t: new Date().getTime() },
        headers: {
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
      setProspects(prev => {
        const novaLista = prev.map(p => p.id === updatedProspect.id ? updatedProspect : p);
        return novaLista.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      });
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
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const clientes = results.data.filter((row: any) => row.CNPJ && String(row.CNPJ).trim() !== '');

          try {
            await api.post('/prospects/importar', { clientes });
          } catch (apiError: any) {
            if (handleAuthError(apiError)) return;
            console.error('Erro na API:', apiError);
          } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchProspects(); 
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
    
    if (prospect.status === 'APROVADO' || prospect.status === 'REPROVADO' || prospect.status === 'POSSIBILIDADE' || prospect.status === 'RETORNAR') {      
      setSelectedProspect(prospect);
      setIsModalOpen(true);
      return;
    }
    
    if (prospect.status === 'PENDENTE') {
      try {
        const response = await api.put(`/prospects/${prospect.id}/travar`, { 
          userId: currentUserId,
          userName: currentUser?.nome 
        });

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
    
    const matchBusca = 
      prospect.nome.toLowerCase().includes(termo) || 
      (prospect.nomeFantasia && prospect.nomeFantasia.toLowerCase().includes(termo)) || 
      prospect.cnpj.includes(termo) || 
      prospect.telefone.includes(termo) ||
      (prospect.endereco && prospect.endereco.toLowerCase().includes(termo));

    const matchWLE = filtroWLE ? prospect.clienteWLE === true : true;
    
    const matchBairro = filtroBairro === 'TODOS' || prospect.bairro === filtroBairro;

    return matchBusca && matchWLE && matchBairro;
  });

  const prospectsPendentes = filteredProspects.filter(p => p.status === 'PENDENTE');
  const prospectsEmAtendimento = filteredProspects.filter(p => p.status === 'EM_ATENDIMENTO');
  const prospectsPossibilidade = filteredProspects.filter(p => p.status === 'POSSIBILIDADE');
  const prospectsAprovados = filteredProspects.filter(p => p.status === 'APROVADO');
  const prospectsReprovados = filteredProspects.filter(p => p.status === 'REPROVADO');
  const prospectsRetornar = filteredProspects.filter(p => p.status === 'RETORNAR');

  return (
    <div className="p-8 bg-[#f4f5f7] h-screen overflow-y-auto font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fila de Prospecção</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie e inicie atendimentos com seus clientes B2B.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1.5 gap-2 w-full xl:w-auto">
            
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm font-medium focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* COMBOBOX DE BAIRROS (SEARCHABLE) */}
            <div className="relative w-full sm:w-56 shrink-0" ref={dropdownRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Todos os Bairros"
                value={bairroSearchTerm}
                onChange={(e) => {
                  setBairroSearchTerm(e.target.value);
                  setIsBairroDropdownOpen(true);
                  if (e.target.value === '') {
                    setFiltroBairro('TODOS'); // Se limpar tudo, reseta o filtro
                  }
                }}
                onClick={() => setIsBairroDropdownOpen(true)}
                className="w-full pl-9 pr-8 py-2 bg-transparent text-sm font-medium focus:outline-none text-slate-700 placeholder:text-slate-700 cursor-text"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              
              {isBairroDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1">
                  <button
                    onClick={() => {
                      setFiltroBairro('TODOS');
                      setBairroSearchTerm('');
                      setIsBairroDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${filtroBairro === 'TODOS' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    Todos os Bairros
                  </button>
                  
                  {filteredBairrosDropdown.map(b => (
                    <button
                      key={b as string}
                      onClick={() => {
                        setFiltroBairro(b as string);
                        setBairroSearchTerm(b as string);
                        setIsBairroDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${filtroBairro === b ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                    >
                      {b as string}
                    </button>
                  ))}

                  {filteredBairrosDropdown.length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center italic">Nenhum bairro encontrado</div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <button
              onClick={() => setFiltroWLE(!filtroWLE)}
              className={`flex w-full sm:w-auto items-center justify-between sm:justify-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filtroWLE ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Apenas WLE</span>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${filtroWLE ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <span 
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    filtroWLE ? 'translate-x-5' : 'translate-x-0.75'
                  }`} 
                />
              </div>
            </button>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="w-full sm:w-auto">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                {isImporting ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
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
          title="Retornar contato" 
          icon={<Clock size={20} className="text-purple-500" />} 
          data={prospectsRetornar}
          emptyMessage="Nenhum cliente para retornar na sua busca."
          onCardClick={handleCardClick}
        />

        <PaginatedSection 
          title="Possibilidades" 
          icon={<Target size={20} className="text-blue-500" />}
          data={prospectsPossibilidade}
          emptyMessage="Nenhuma possibilidade de venda registrada na sua busca."
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
          onUpdate={handleUpdateProspect}
        />
      )}
    </div>
  );
}