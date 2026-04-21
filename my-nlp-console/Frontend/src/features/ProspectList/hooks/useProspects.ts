import { useState, useEffect, useCallback } from 'react';
import { socket } from '../../../services/socket'
import type { Prospect } from '../../../types/prospect.types';
import { prospectService } from '../../../services/prospect.service';
import { api } from '../../../services/api'; 

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const fetchProspects = useCallback(async () => {
    try {
      const data = await prospectService.getProspects();
      setProspects(data);
    } catch (error) {
      console.error('Erro ao carregar prospects:', error);
    }
  }, []);

  const updateProspectLocal = useCallback((updatedProspect: Prospect) => {
    setProspects(prev => {
      const novaLista = prev.map(p => p.id === updatedProspect.id ? updatedProspect : p);
      return novaLista.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    });
  }, []);

  useEffect(() => {
    fetchProspects();

    socket.on('prospectUpdated', updateProspectLocal);
    socket.on('prospectsRefresh', fetchProspects);

    return () => {
      socket.disconnect();
    };
  }, [fetchProspects, updateProspectLocal]);

  return { prospects, fetchProspects, updateProspectLocal };
}