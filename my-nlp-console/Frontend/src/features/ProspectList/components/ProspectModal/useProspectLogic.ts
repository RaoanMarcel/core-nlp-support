import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Prospect } from '../../../../types/prospect.types';
import { api } from '../../../../services/api';
import type { Historico, ContactFormState, InteractionFormState } from './types';
import { parseModulos } from '../../../../utils/utils';

export const useProspectLogic = (
  prospect: Prospect, 
  currentUserId: string, 
  currentUserName: string, 
  onClose: () => void,
  onUpdate?: (updated: Prospect) => void 
) => {
  const isFinished = ['APROVADO', 'REPROVADO', 'POSSIBILIDADE', 'RETORNAR'].includes(prospect.status);

  const [ui, setUi] = useState({ isEditing: !isFinished, isEditingContatos: false });
  const [loading, setLoading] = useState({ historico: true, saving: false, savingContatos: false });
  const [historico, setHistorico] = useState<Historico[]>([]);
  
  const [contactForm, setContactForm] = useState<ContactFormState>({
    telefone: prospect.telefone || '',
    telefoneSecundario: prospect.telefoneSecundario || '',
    email: prospect.email || '',
    valor: prospect.valor ? prospect.valor.toString() : '' 
  });

  const [interactionForm, setInteractionForm] = useState<InteractionFormState>({
    observacoes: '',
    modulos: parseModulos(prospect.novosModulos)
  });

  useEffect(() => {
    setContactForm({
      telefone: prospect.telefone || '',
      telefoneSecundario: prospect.telefoneSecundario || '',
      email: prospect.email || '',
      valor: prospect.valor ? prospect.valor.toString() : '' 
    });
    setInteractionForm({
      observacoes: '',
      modulos: parseModulos(prospect.novosModulos)
    });
    setUi(prev => ({ ...prev, isEditing: !isFinished }));
  }, [prospect, isFinished]); 

  const requestApi = useCallback(async (method: 'get' | 'patch' | 'post', endpoint: string, data?: unknown) => {
    return api({ method, url: `/prospects/${prospect.id}/${endpoint}`, data });
  }, [prospect.id]);

  const loadHistorico = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, historico: true }));
      const { data } = await requestApi('get', 'historico');
      setHistorico(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(prev => ({ ...prev, historico: false }));
    }
  }, [requestApi]);

  useEffect(() => { loadHistorico(); }, [loadHistorico]);

  const saveContatos = async () => {
    setLoading(prev => ({ ...prev, savingContatos: true }));
    try {
      const payload = {
        ...contactForm,
        valor: contactForm.valor ? parseFloat(contactForm.valor) : null,
        usuarioLogado: currentUserName
      };

      const { data } = await requestApi('patch', 'update', payload);
      
      if (onUpdate && data.prospect) {
        onUpdate(data.prospect); 
      }

      setUi(prev => ({ ...prev, isEditingContatos: false }));
      await loadHistorico();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, savingContatos: false }));
    }
  };

  const saveInteracao = async (extraData = {}) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data } = await requestApi('patch', 'update', {
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        usuarioLogado: currentUserName,
        ...extraData
      });

      if (onUpdate && data.prospect) {
        onUpdate(data.prospect);
      }

      setInteractionForm(p => ({ ...p, observacoes: '' }));
      if (Object.keys(extraData).length > 0) onClose();
      else await loadHistorico();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const finishAtendimento = async (acao: string) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data } = await requestApi('post', 'finish', {
        acao,
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        atendidoPor: currentUserName
      });
      if (onUpdate && data.prospect) onUpdate(data.prospect);
      onClose();
    } catch (error) { console.error(error); } 
    finally { setLoading(prev => ({ ...prev, saving: false })); }
  };

  const handleVoltar = async () => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data } = await requestApi('patch', 'update', {
        status: 'PENDENTE',
        usuarioLogado: currentUserName,
        observacoes: 'Atendimento devolvido para a fila.',
        novosModulos: []
      });

      if (onUpdate && data.prospect) {
        onUpdate(data.prospect);
      }

      onClose(); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const dadosPrimeiroAtendimento = useMemo(() => {
    const primeiro = [...historico].reverse().find(h => 
      ['APROVADO', 'REPROVADO', 'POSSIBILIDADE', 'RETORNAR'].some(status => 
        h.acao?.toUpperCase().includes(status)
      )
    );

    return {
      nomeAtendente: primeiro ? primeiro.usuario : (loading.historico ? 'Buscando...' : 'Desconhecido'),
      dataHoraAtendimento: primeiro 
        ? `${new Date(primeiro.createdAt).toLocaleDateString('pt-BR')} às ${new Date(primeiro.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : '--:--'
    };
  }, [historico, loading.historico]);

  return {
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    dadosPrimeiroAtendimento,
    handleContactChange: (field: keyof ContactFormState, value: string) => setContactForm(prev => ({ ...prev, [field]: value })),
    toggleModulo: (modulo: string) => {
      if (!ui.isEditing) return;
      setInteractionForm(prev => ({
        ...prev,
        modulos: prev.modulos.includes(modulo) ? prev.modulos.filter(m => m !== modulo) : [...prev.modulos, modulo]
      }));
    },
    saveContatos, saveInteracao, finishAtendimento, setInteractionForm, handleVoltar
  };
};