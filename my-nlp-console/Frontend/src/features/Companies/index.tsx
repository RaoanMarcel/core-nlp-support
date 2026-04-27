import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2, X, RefreshCw, ChevronRight, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { companyService } from '../../services/company.service';
import { useCan } from '../../hooks/useCan';
import CompanyModal from './CompanyModal';
import type { ICompany } from '../../types/company.types';

export default function CompaniesPage() {
  const { can } = useCan();
  const canCreateCompany = can('companies:create');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyEditando, setCompanyEditando] = useState<ICompany | null>(null);

  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  
  const [companiesList, setCompaniesList] = useState<ICompany[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT = 15;

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await companyService.getAll({
        termo: termo.trim() || undefined,
        status: statusFiltro !== 'TODOS' ? statusFiltro : undefined,
        page: page,
        limit: LIMIT
      });
      
      let finalData: ICompany[] = [];
      let totalCount = 0;

      // 1. Tratamento de Resposta (Paginada ou Array Puro)
      if (response && 'data' in response && Array.isArray(response.data)) {
        // Backend já está paginando corretamente
        finalData = response.data;
        totalCount = response.total || 0;
      } else if (Array.isArray(response)) {
        // Backend mandou Array puro (Paginação manual no Front)
        totalCount = response.length;
        const start = (page - 1) * LIMIT;
        finalData = response.slice(start, start + LIMIT);
      }

      setCompaniesList(finalData);
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / LIMIT) || 1);

    } catch (err: any) {
      console.error("Erro ao buscar empresas:", err);
      setCompaniesList([]);
    } finally {
      setIsLoading(false);
    }
  }, [termo, statusFiltro, page]);

  // Hook para disparar a busca
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Reset de página ao filtrar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermo(e.target.value);
    setPage(1); 
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFiltro(newStatus);
    setPage(1);
  };

  const handleOpenNewCompany = () => {
    if (!canCreateCompany) return;
    setCompanyEditando(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: ICompany) => {
    setCompanyEditando(company);
    setIsModalOpen(true);
  };

  const limparFiltros = () => {
    setTermo('');
    setStatusFiltro('TODOS');
    setPage(1);
  };

  const getStatusBadge = (ativo: boolean) => (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
      ativo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
    }`}>
      {ativo ? 'ativo' : 'inativo'}
    </span>
  );

  return (
    <>
      <div className="p-4 md:p-8 h-dvh flex flex-col bg-theme-base animate-in fade-in duration-300 w-full overflow-hidden transition-colors pb-20 md:pb-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-theme-text tracking-tight">
              Empresas {statusFiltro !== 'TODOS' && `- ${statusFiltro}`}
            </h1>
            <p className="text-theme-muted text-sm mt-1">
              {totalItems} registros no total
            </p>
          </div>
          
          {canCreateCompany && (
            <button 
              onClick={handleOpenNewCompany}
              className="bg-theme-accent hover:opacity-90 text-white px-5 py-2.5 rounded-shape-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={18} /> Nova Empresa
            </button>
          )}
        </div>

        {/* FILTROS */}
        <div className="flex flex-col gap-4 mb-6 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['TODOS', 'ATIVOS', 'INATIVOS'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 ${
                  statusFiltro === s 
                    ? 'bg-theme-text border-theme-text text-theme-base' 
                    : 'bg-theme-panel border-theme-border text-theme-text'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center bg-theme-panel border border-theme-border rounded-shape-lg px-3 py-2.5 focus-within:border-theme-accent transition-all">
              <Search size={18} className="text-theme-muted mr-2" />
              <input 
                type="text" 
                value={termo}
                onChange={handleSearchChange}
                placeholder="Buscar por Razão Social, CNPJ ou Fantasia..." 
                className="bg-transparent border-none outline-none w-full text-sm text-theme-text"
              />
            </div>
            <button onClick={fetchCompanies} className="bg-theme-panel border border-theme-border text-theme-text px-6 py-2.5 rounded-shape-lg text-sm font-bold flex items-center justify-center gap-2">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Atualizar
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-y-auto bg-theme-panel border border-theme-border shadow-sm rounded-shape-lg flex flex-col custom-scrollbar">
          {isLoading && companiesList.length === 0 ? (
            <div className="flex items-center justify-center h-60 flex-1">
              <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : companiesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
              <Building2 size={48} className="text-theme-muted/30 mb-4" />
              <h3 className="text-lg font-bold text-theme-text">Nenhuma empresa encontrada</h3>
              <p className="text-theme-muted text-sm">Tente ajustar seus filtros ou busca.</p>
            </div>
          ) : (
            <div className="divide-y divide-theme-border">
              {companiesList.map((company) => (
                <div 
                  key={company.id} 
                  onClick={() => handleEditCompany(company)} 
                  className="group flex items-center justify-between p-4 hover:bg-theme-base cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-theme-muted">{company.cnpj || 'SEM CNPJ'}</span>
                      {getStatusBadge(company.ativo)}
                    </div>
                    <h4 className="font-bold text-theme-text truncate">{company.razaoSocial || company.nomeFantasia}</h4>
                    <div className="flex gap-4 mt-2 text-theme-muted text-xs">
                      {company.telefonePrincipal && <span className="flex items-center gap-1"><Phone size={12}/>{company.telefonePrincipal}</span>}
                      {company.cidade && <span className="flex items-center gap-1"><MapPin size={12}/>{company.cidade} - {company.uf}</span>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-theme-muted group-hover:text-theme-accent" />
                </div>
              ))}
            </div>
          )}

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-theme-border bg-theme-base/50 flex items-center justify-between mt-auto">
              <span className="text-xs text-theme-muted">Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 border border-theme-border rounded-md disabled:opacity-30 bg-theme-panel"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 border border-theme-border rounded-md disabled:opacity-30 bg-theme-panel"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CompanyModal 
        isOpen={isModalOpen}
        companyEditando={companyEditando} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchCompanies}
      />
    </>
  );
}