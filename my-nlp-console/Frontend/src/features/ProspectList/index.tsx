import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Search, RefreshCw, Inbox, PlayCircle, CheckCircle2, XCircle, Target, Clock, MapPin, ChevronDown, FileX } from 'lucide-react';
import type { Prospect } from '../../types/prospect.types';
import { useProspects } from './hooks/useProspects';
import { useProspectFilters } from './hooks/useProspectFilters';
import { useClickOutside } from '../../hooks/useClickOutside';
import { PaginatedSection } from './components/PaginatedSection';
import { prospectService } from '../../services/prospect.service';
import ProspectModal from './components/ProspectModal';

export default function ProspectList() {
  const { prospects, fetchProspects, updateProspectLocal } = useProspects();
  const filters = useProspectFilters(prospects);
  
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBairroDropdownOpen, setIsBairroDropdownOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.id || '';

  const hasPermission = (permissionSlug: string) => {
    return currentUser?.permissions?.includes(permissionSlug);
  };

  const canImportCSV = hasPermission('prospects:import');
  const canInteract = hasPermission('prospects:interact');

  useClickOutside(dropdownRef as React.RefObject<any>, () => {
    setIsBairroDropdownOpen(false);
    if (filters.bairroSearchTerm.trim() === '') filters.setFiltroBairro('TODOS');
  });

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
          await prospectService.importCSV(clientes);
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          fetchProspects();
        }
      });
    } catch (error) {
      console.error('Falha ao processar CSV', error);
      setIsImporting(false);
    }
  };

  const handleCardClick = async (prospect: Prospect) => {
    if (!canInteract) {
      alert('Acesso Negado: Você não tem permissão para atender ou interagir com clientes.');
      return;
    }

    if (prospect.status === 'EM_ATENDIMENTO') return;

    if (['APROVADO', 'REPROVADO', 'POSSIBILIDADE', 'RETORNAR'].includes(prospect.status)) {
      setSelectedProspect(prospect);
      setIsModalOpen(true);
      return;
    }

    if (prospect.status === 'PENDENTE') {
      try {
        const updatedProspect = await prospectService.lockProspect(
          prospect.id,
          currentUserId,
          currentUser?.nome
        );
        setSelectedProspect(updatedProspect);
        setIsModalOpen(true);
      } catch (error: any) {
        if (error.response?.status === 409) {
          alert('Este cliente já está sendo atendido por outro usuário.');
        }
      }
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-theme-base h-screen overflow-y-auto font-sans pb-24 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-theme-text tracking-tight transition-colors">
              Fila de Prospecção
            </h1>
            <p className="text-theme-muted text-sm mt-1 transition-colors">
              Gerencie e inicie atendimentos com seus clientes B2B.
            </p>
          </div>

          {/* FILTROS */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center bg-theme-panel border border-theme-border rounded-xl shadow-sm p-2 gap-2 w-full transition-colors">

            {/* BUSCA */}
            <div className="relative w-full md:w-55 lg:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none text-theme-text placeholder-theme-muted"
              />
            </div>

            <div className="hidden md:block w-px h-6 bg-theme-border"></div>

            {/* BAIRRO */}
            <div className="relative w-full md:w-55 lg:w-56" ref={dropdownRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
              <input
                type="text"
                placeholder="Todos os Bairros"
                value={filters.bairroSearchTerm}
                onChange={(e) => {
                  filters.setBairroSearchTerm(e.target.value);
                  setIsBairroDropdownOpen(true);
                  if (e.target.value === '') filters.setFiltroBairro('TODOS');
                }}
                onClick={() => setIsBairroDropdownOpen(true)}
                className="w-full pl-9 pr-8 py-2 bg-transparent text-sm focus:outline-none text-theme-text placeholder-theme-muted"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />

              {isBairroDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-theme-panel border border-theme-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1">
                  <button
                    onClick={() => {
                      filters.setFiltroBairro('TODOS');
                      filters.setBairroSearchTerm('');
                      setIsBairroDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      filters.filtroBairro === 'TODOS'
                        ? 'text-theme-accent bg-theme-accent/10'
                        : 'text-theme-text hover:bg-theme-base'
                    }`}
                  >
                    Todos os Bairros
                  </button>

                  {filters.filteredBairrosDropdown.map((b) => (
                    <button
                      key={b as string}
                      onClick={() => {
                        filters.setFiltroBairro(b as string);
                        filters.setBairroSearchTerm(b as string);
                        setIsBairroDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        filters.filtroBairro === b
                          ? 'text-theme-accent bg-theme-accent/10'
                          : 'text-theme-text hover:bg-theme-base'
                      }`}
                    >
                      {b as string}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:block w-px h-6 bg-theme-border"></div>

            {/* TOGGLE */}
            <button
              onClick={() => filters.setFiltroWLE(!filters.filtroWLE)}
              className={`flex w-full md:w-auto items-center justify-between md:justify-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold ${
                filters.filtroWLE
                  ? 'bg-theme-accent/10 text-theme-accent'
                  : 'text-theme-muted hover:bg-theme-base'
              }`}
            >
              <span>Apenas WLE</span>
              <div className={`relative inline-flex items-center h-5 w-9 rounded-full ${
                filters.filtroWLE ? 'bg-theme-accent' : 'bg-theme-border'
              }`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white ${
                  filters.filtroWLE ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </button>

            {canImportCSV && (
              <>
                <div className="hidden md:block w-px h-6 bg-theme-border"></div>

                <div className="w-full md:w-auto">
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="w-full md:w-auto flex justify-center items-center gap-2 bg-theme-accent text-white hover:brightness-90 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {isImporting
                      ? <RefreshCw size={18} className="animate-spin" />
                      : <UploadCloud size={18} />}
                    {isImporting ? 'Enviando...' : 'Importar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="border-theme-border mb-8 transition-colors" />

        <PaginatedSection title="Para Triagem" icon={<Inbox size={20} className="text-sky-500" />} data={filters.groupedProspects.pendentes} emptyMessage="Não há nenhum cliente aguardando atendimento." onCardClick={handleCardClick} />
        <PaginatedSection title="Em Atendimento" icon={<PlayCircle size={20} className="text-yellow-500" />} data={filters.groupedProspects.emAtendimento} emptyMessage="Nenhum cliente está sendo atendido neste momento." onCardClick={handleCardClick} />
        <PaginatedSection title="Retornar contato" icon={<Clock size={20} className="text-violet-500" />} data={filters.groupedProspects.retornar} emptyMessage="Nenhum cliente para retornar." onCardClick={handleCardClick} />
        <PaginatedSection title="Possibilidades" icon={<Target size={20} className="text-blue-500" />} data={filters.groupedProspects.possibilidade} emptyMessage="Nenhuma possibilidade de venda." onCardClick={handleCardClick} />
        <PaginatedSection title="Interessados" icon={<CheckCircle2 size={20} className="text-green-500" />} data={filters.groupedProspects.aprovados} emptyMessage="Nenhuma venda aprovada." onCardClick={handleCardClick} />
        <PaginatedSection title="Não Interessados" icon={<XCircle size={20} className="text-red-500" />} data={filters.groupedProspects.reprovados} emptyMessage="Nenhum cliente reprovado." onCardClick={handleCardClick} />
        <PaginatedSection title="CNPJ Baixado" icon={<FileX size={20} className="text-slate-500" />} data={filters.groupedProspects.cnpjBaixado} emptyMessage="Nenhum CNPJ baixado na receita." onCardClick={handleCardClick} />

      </div>

      {isModalOpen && selectedProspect && (
        <ProspectModal
          prospect={selectedProspect}
          onClose={() => setIsModalOpen(false)}
          currentUserId={currentUserId}
          currentUserName={currentUser?.nome || 'Usuário'}
          onUpdate={(upd) => {
            updateProspectLocal(upd);
            setSelectedProspect(upd);
          }}
        />
      )}
    </div>
  );
}