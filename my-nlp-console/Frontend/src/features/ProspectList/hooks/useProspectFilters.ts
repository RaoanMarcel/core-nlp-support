import { useState, useMemo } from 'react';
import type { Prospect } from '../../../types/prospect.types';

export function useProspectFilters(prospects: Prospect[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroWLE, setFiltroWLE] = useState(false);
  const [filtroBairro, setFiltroBairro] = useState('TODOS');
  const [bairroSearchTerm, setBairroSearchTerm] = useState('');

  const bairrosDisponiveis = useMemo(() => {
    return Array.from(new Set(prospects.map(p => p.bairro).filter(Boolean))).sort();
  }, [prospects]);

  const filteredBairrosDropdown = useMemo(() => {
    return bairrosDisponiveis.filter(b => 
      (b as string).toLowerCase().includes(bairroSearchTerm.toLowerCase())
    );
  }, [bairrosDisponiveis, bairroSearchTerm]);

  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
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
  }, [prospects, searchQuery, filtroWLE, filtroBairro]);

  const groupedProspects = useMemo(() => ({
    pendentes: filteredProspects.filter(p => p.status === 'PENDENTE'),
    emAtendimento: filteredProspects.filter(p => p.status === 'EM_ATENDIMENTO'),
    possibilidade: filteredProspects.filter(p => p.status === 'POSSIBILIDADE'),
    aprovados: filteredProspects.filter(p => p.status === 'APROVADO'),
    reprovados: filteredProspects.filter(p => p.status === 'REPROVADO'),
    retornar: filteredProspects.filter(p => p.status === 'RETORNAR'),
    cnpjBaixado: filteredProspects.filter(p => p.status === 'CNPJ_BAIXADO')
  }), [filteredProspects]);

  return {
    searchQuery, setSearchQuery,
    filtroWLE, setFiltroWLE,
    filtroBairro, setFiltroBairro,
    bairroSearchTerm, setBairroSearchTerm,
    bairrosDisponiveis,
    filteredBairrosDropdown,
    groupedProspects
  };
}