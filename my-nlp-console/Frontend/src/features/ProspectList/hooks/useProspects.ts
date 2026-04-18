import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
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

    // Extrai a URL letal diretamente da sua instância Axios configurada
    // Garantindo que WebSockets e HTTP apontem sempre para o mesmo covil.
    const SOCKET_URL = api.defaults.baseURL || 'https://core-nlp-support.onrender.com';
    
    const socket = io(SOCKET_URL);

    socket.on('prospectUpdated', updateProspectLocal);
    socket.on('prospectsRefresh', fetchProspects);

    return () => {
      socket.disconnect();
    };
  }, [fetchProspects, updateProspectLocal]);

  return { prospects, fetchProspects, updateProspectLocal };
}