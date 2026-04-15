import { useState, useEffect, useCallback } from 'react';
import { type Prospect } from '../Contratos';
import type { 
  Historico, 
  ContactFormState, 
  InteractionFormState 
} from './types';
import { parseModulos } from './prospectUtils';
import { api } from '../../services/api'; 

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
    return api({
      method,
      url: `/prospects/${prospect.id}/${endpoint}`,
      data
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
      const payload = {
        ...contactForm,
        valor: contactForm.valor ? parseFloat(contactForm.valor) : null,
        observacoes: "Atualizou dados cadastrais/financeiros.",
        usuarioLogado: currentUserName
      };

      const { data } = await requestApi('patch', 'update', payload);

      // Correção Arquitetural: O backend retorna { message: string, prospect: Prospect }
      const prospectAtualizado = data.prospect;

      // Dispara o update para a lista-pai (Always Sync UI)
      if (onUpdate && prospectAtualizado) {
        onUpdate(prospectAtualizado);
      }

      // Atualiza o estado local do formulário com os dados persistidos no banco
      setContactForm({
        telefone: prospectAtualizado?.telefone ?? '',
        telefoneSecundario: prospectAtualizado?.telefoneSecundario ?? '',
        email: prospectAtualizado?.email ?? '',
        valor: prospectAtualizado?.valor ? prospectAtualizado.valor.toString() : ''
      });

      setUi(prev => ({ ...prev, isEditingContatos: false }));

      await loadHistorico();
    } catch (error) {
      console.error("Erro ao salvar contatos:", error);
      // TODO: Padrão Rose (toast alert) para notificar falha ao usuário aqui
    } finally {
      setLoading(prev => ({ ...prev, savingContatos: false }));
    }
  };

  const saveInteracao = async (extraData = {}) => {
    if (!interactionForm.observacoes && interactionForm.modulos.length === 0 && Object.keys(extraData).length === 0) return;
    
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data } = await requestApi('patch', 'update', {
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        usuarioLogado: currentUserName,
        ...extraData
      });

      // Correção: Extrai o prospect do data wrapper
      if (onUpdate && data.prospect) {
        onUpdate(data.prospect);
      }

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
      const { data } = await requestApi('post', 'finish', {
        acao,
        observacoes: interactionForm.observacoes,
        novosModulos: interactionForm.modulos,
        atendidoPor: currentUserName
      });

      // Correção: Extrai o prospect do data wrapper
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

  const handleVoltar = async () => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data } = await requestApi('patch', 'update', {
        status: 'PENDENTE',
        usuarioLogado: currentUserName,
        observacoes: 'Atendimento devolvido para a fila.',
        novosModulos: []
      });

      // Correção: Extrai o prospect do data wrapper
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

  return {
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    handleContactChange, toggleModulo, setInteractionForm,
    saveContatos, saveInteracao, finishAtendimento, handleVoltar
  };
};