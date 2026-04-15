import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { type Prospect } from '../Contratos';
import type { 
  Historico, 
  ContactFormState, 
  InteractionFormState 
} from './types';
import { parseModulos } from './prospectUtils';

const API_URL = 'https://core-nlp-support.onrender.com/prospects';

export const useProspectLogic = (
  prospect: Prospect, 
  currentUserId: string, 
  currentUserName: string, 
  onClose: () => void
) => {
  const isFinished = ['APROVADO', 'REPROVADO', 'POSSIBILIDADE', 'RETORNAR'].includes(prospect.status);

  // Estados Unificados
  const [ui, setUi] = useState({ isEditing: !isFinished, isEditingContatos: false });
  const [loading, setLoading] = useState({ historico: true, saving: false, savingContatos: false });
  const [historico, setHistorico] = useState<Historico[]>([]);
  
  const [contactForm, setContactForm] = useState<ContactFormState>({
    telefone: prospect.telefone || '',
    telefoneSecundario: prospect.telefoneSecundario || '',
    email: prospect.email || ''
  });

  const [interactionForm, setInteractionForm] = useState<InteractionFormState>({
    observacoes: '',
    modulos: parseModulos(prospect.novosModulos)
  });

  // Client de API Abstraído
  const requestApi = useCallback(async (method: 'get' | 'patch' | 'post', endpoint: string, data?: unknown) => {
    const token = localStorage.getItem('@CRM:token');
    if (!token) throw new Error("Usuário não autenticado");
    
    return axios({
      method,
      url: `${API_URL}/${prospect.id}/${endpoint}`,
      data,
      headers: { Authorization: `Bearer ${token}` }
    });
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

  useEffect(() => {
    loadHistorico();
  }, [loadHistorico]);

  // Handlers de Ação
  const handleContactChange = (field: keyof ContactFormState, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleModulo = (modulo: string) => {
    if (!ui.isEditing) return;
    setInteractionForm(prev => ({
      ...prev,
      modulos: prev.modulos.includes(modulo) 
        ? prev.modulos.filter(m => m !== modulo) 
        : [...prev.modulos, modulo]
    }));
  };

  const saveContatos = async () => {
    setLoading(prev => ({ ...prev, savingContatos: true }));
    try {
      await requestApi('patch', 'update', {
        ...contactForm,
        observacoes: "Atualizou os dados de contato.",
        usuarioLogado: currentUserName
      });
      setUi(prev => ({ ...prev, isEditingContatos: false }));
      await loadHistorico();
    } catch (error) {
      console.error('Erro ao atualizar contatos:', error);
    } finally {
      setLoading(prev => ({ ...prev, savingContatos: false }));
    }
  };

  const saveInteracao = async (extraPayload = {}) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      await requestApi('patch', 'update', {
        observacoes: interactionForm.observacoes.trim(),
        novosModulos: interactionForm.modulos,
        usuarioLogado: currentUserName,
        ...extraPayload
      });
      setInteractionForm(prev => ({ ...prev, observacoes: '' }));
      setUi(prev => ({ ...prev, isEditing: false }));
      await loadHistorico();
    } catch (error) {
      console.error('Erro na atualização:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const finishAtendimento = async (acao: string) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      await requestApi('post', 'finish', {
        userId: currentUserId,
        atendidoPor: currentUserName,
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        acao
      });
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return {
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    handleContactChange, toggleModulo, setInteractionForm,
    saveContatos, saveInteracao, finishAtendimento
  };
};