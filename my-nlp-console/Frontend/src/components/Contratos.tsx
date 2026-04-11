import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Search, Phone, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import ProspectModal from './ContratosModal';

export interface Prospect {
  id: string;
  cnpj: string;
  nome: string;
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO';
  atendente?: string; 
  
  // Novas colunas (opcionais para não quebrar telas antigas)
  simplesNacional?: string;
  situacaoCadastral?: string;
  telefoneSecundario?: string;
  email?: string;
  atividadePrincipal?: string;
  telefoneBackup?: string;
}

const API_URL = 'http://localhost:3000/prospects';

export default function ProspectList() {
  const [prospects, setProspects] = useState<Prospect[]>([]); 
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = "user-123"; 

  // ==========================================
  // BUSCAR DO BANCO DE DADOS
  // ==========================================
  const fetchProspects = async () => {
    try {
      const response = await fetch(`${API_URL}?t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) throw new Error('Falha ao buscar dados');
      
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      console.error('Erro ao carregar prospects:', error);
      alert('Erro ao carregar a lista do banco de dados.');
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // ==========================================
  // IMPORTAR CSV LENDO PELAS COLUNAS EXATAS
  // ==========================================
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
        header: false, // <-- TRUQUE: Ignora nomes e usa os números das colunas
        skipEmptyLines: true,
        complete: async (results) => {
          // A primeira linha (index 0) será o cabeçalho. Pegamos apenas os dados:
          const dataRows = results.data.slice(1);

          const novosProspects = dataRows
            .filter((row: any) => row[0]) // Só importa se a Coluna A (CNPJ) existir
            .map((row: any) => ({
              cnpj:               String(row[0] || '').trim(), // A
              nome:               String(row[1] || 'Sem Nome').trim(), // B
              simplesNacional:    String(row[8] || '').trim(), // I
              situacaoCadastral:  String(row[16] || '').trim(), // Q
              telefone:           String(row[23] || 'Sem Telefone').trim(), // X
              telefoneSecundario: String(row[24] || '').trim(), // Y
              email:              String(row[25] || '').trim(), // Z
              atividadePrincipal: String(row[37] || '').trim(), // AL
              telefoneBackup:     String(row[41] || '').trim(), // AP
              modulosAtuais:      String(row[42] || 'Nenhum').trim() // AQ
            }));

          try {
            const response = await fetch(`${API_URL}/importar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prospects: novosProspects })
            });

            if (!response.ok) throw new Error('Erro ao salvar no banco');
            
            const resultData = await response.json();
            alert(resultData.message || 'Importação concluída!');
            await fetchProspects(); 

          } catch (apiError) {
            console.error('Erro na API:', apiError);
            alert('Falha ao enviar os dados para o servidor.');
          } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      console.error(error);
      alert('Falha ao processar CSV.');
      setIsImporting(false);
    }
  };

  // ==========================================
  // TRAVAR CLIENTE NO BANCO AO CLICAR
  // ==========================================
  const handleCardClick = async (prospect: Prospect) => {
    if (prospect.status !== 'PENDENTE') {
      alert(`Este cliente já está em status: ${prospect.status}`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${prospect.id}/travar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (response.status === 409) {
        alert('Este cliente acabou de ser pego por outro operador!');
        fetchProspects(); 
        return;
      }

      if (!response.ok) throw new Error('Erro ao travar cliente no backend');

      const updatedProspect = await response.json();

      setProspects(prev => prev.map(p => p.id === prospect.id ? updatedProspect : p));
      setSelectedProspect(updatedProspect);
      setIsModalOpen(true);

    } catch (error) {
      console.error('Erro ao travar:', error);
      alert('Não foi possível iniciar o atendimento.');
    }
  };

  // ==========================================
  // LÓGICA DE FILTROS E PAGINAÇÃO
  // ==========================================
  const filteredProspects = prospects.filter(prospect => {
    const termo = searchQuery.toLowerCase();
    const matchBusca = 
      prospect.nome.toLowerCase().includes(termo) || 
      prospect.cnpj.includes(termo) || 
      prospect.telefone.includes(termo);

    const matchStatus = 
      statusFilter === 'TODOS' ? true :
      statusFilter === 'FINALIZADOS' ? (prospect.status === 'APROVADO' || prospect.status === 'REPROVADO') :
      prospect.status === statusFilter;

    return matchBusca && matchStatus;
  });

  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProspects = filteredProspects.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ==========================================
  // ESTILOS VISUAIS REFINADOS
  // ==========================================
  const getCardStyle = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-white border-transparent hover:border-blue-300 hover:shadow-sm hover:ring-1 hover:ring-blue-100 cursor-pointer';
      case 'EM_ATENDIMENTO': return 'bg-amber-50/40 border-amber-200 opacity-90 cursor-not-allowed';
      case 'APROVADO': return 'bg-emerald-50/40 border-emerald-200 opacity-80 cursor-default';
      case 'REPROVADO': return 'bg-rose-50/40 border-rose-200 opacity-80 cursor-default';
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

  return (
    <div className="p-8 bg-[#f4f5f7] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fila de Prospecção</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie e inicie atendimentos com seus clientes B2B.</p>
          </div>
          <div>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <UploadCloud size={18} />
              {isImporting ? 'Enviando...' : 'Importar CSV'}
            </button>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CNPJ ou Telefone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes (Livres)</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="FINALIZADOS">Finalizados</option>
            </select>
          </div>
        </div>

        {/* Grid de Cards */}
        {paginatedProspects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium text-sm">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedProspects.map((prospect) => (
              <div 
                key={prospect.id} 
                onClick={() => handleCardClick(prospect)}
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
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold">{prospect.telefone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 mt-4">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900">{startIndex + 1}</strong> até <strong className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProspects.length)}</strong> de <strong className="text-slate-900">{filteredProspects.length}</strong> clientes
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:border hover:border-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-400 text-xs px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal */}
      {isModalOpen && selectedProspect && (
        <ProspectModal 
          prospect={selectedProspect} 
          onClose={() => {
            setIsModalOpen(false);
            fetchProspects(); 
          }} 
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}