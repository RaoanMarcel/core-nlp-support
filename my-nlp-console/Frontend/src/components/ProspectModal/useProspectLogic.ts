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
    email: prospect.email || '',
    valor: prospect.valor ? prospect.valor.toString() : '' // Inicializa o valor
  });

  const [interactionForm, setInteractionForm] = useState<InteractionFormState>({
    observacoes: '',
    modulos: parseModulos(prospect.novosModulos)
  });

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
        valor: contactForm.valor ? parseFloat(contactForm.valor) : null, // Envia como número
        observacoes: "Atualizou dados cadastrais/financeiros.",
        usuarioLogado: currentUserName
      });
      setUi(prev => ({ ...prev, isEditingContatos: false }));
      await loadHistorico();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, savingContatos: false }));
    }
  };

  const saveInteracao = async (extraData = {}) => {
    if (!interactionForm.observacoes && interactionForm.modulos.length === 0 && Object.keys(extraData).length === 0) return;
    
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      await requestApi('patch', 'update', {
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        usuarioLogado: currentUserName,
        ...extraData
      });
      setInteractionForm(p => ({ ...p, observacoes: '' }));
      setUi(p => ({ ...p, isEditing: false }));
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
      await requestApi('patch', 'finalizar', {
        acao,
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        atendidoPor: currentUserName
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return {
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    handleContactChange, toggleModulo, setInteractionForm,
    saveContatos, saveInteracao, finishAtendimento
  };
};