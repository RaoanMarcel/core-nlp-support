// Frontend/src/features/Quotes/useQuoteModal.ts
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { planService } from '../../services/plan.service';
import type { IQuote } from './types';
import type { Plan } from '../../types/plan.types';
import { useToast } from '../../contexts/ToastContext';

export function useQuoteModal(quote: IQuote | null, onClose: () => void) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]); // ✨ Agora é um Array

  const [formData, setFormData] = useState({
    nomeCliente: '',
    cnpj: '',
    endereco: '',
    email: '',
    telefonePrincipal: '',
    telefoneSecundario: '',
    interesses: '', 
    observacoes: '',
    plano: 'MENSAL' as 'MENSAL' | 'ANUAL',
    usuariosExtras: 0, // ✨ NOVO
    valorUsuarioExtra: 0, // ✨ NOVO
    valorNegociado: '' as number | string
  });
  
  const [isNegotiating, setIsNegotiating] = useState(false); 

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planService.getPlans();
        setPlans(data);
      } catch (error) {
        addToast('Erro ao carregar a lista de planos.', 'error');
      }
    };
    fetchPlans();
  }, [addToast]);

  useEffect(() => {
    if (quote) {
      setFormData({
        nomeCliente: quote.nomeCliente || '',
        cnpj: quote.cnpj || '',
        endereco: quote.endereco || '',
        email: quote.email || '',
        telefonePrincipal: quote.telefonePrincipal || '',
        telefoneSecundario: quote.telefoneSecundario || '',
        interesses: quote.interesses || '',
        observacoes: quote.observacoes || '',
        plano: quote.plano || 'MENSAL',
        usuariosExtras: quote.usuariosExtras || 0,
        valorUsuarioExtra: quote.valorUsuarioExtra || 0,
        valorNegociado: quote.valorNegociado !== quote.valorBase ? quote.valorNegociado : ''
      });
      
      if (quote.valorNegociado !== quote.valorBase) setIsNegotiating(true);
    }
  }, [quote]);

  // ✨ Seleciona os planos corretos se houver mais de um no histórico
  useEffect(() => {
    if (quote && plans.length > 0 && quote.modulos?.length > 0) {
      const matchedIds = plans
        .filter(p => quote.modulos.includes(p.nome))
        .map(p => p.id);
      setSelectedPlanIds(matchedIds);
    }
  }, [quote, plans]);

  // ✨ Alterna a seleção do plano
  const togglePlanSelection = (planId: string) => {
    setSelectedPlanIds(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : [...prev, planId]
    );
  };

  // ✨ Cálculo dinâmico unindo Planos + Usuários Extras
  const valorTabela = useMemo(() => {
    let somaPlanos = 0;
    const planosSelecionados = plans.filter(p => selectedPlanIds.includes(p.id));
    
    planosSelecionados.forEach(p => {
      somaPlanos += p.valorBase;
    });

    const valorTotalUsuarios = (Number(formData.usuariosExtras) || 0) * (Number(formData.valorUsuarioExtra) || 0);
    const totalParcial = somaPlanos + valorTotalUsuarios;

    return formData.plano === 'ANUAL' ? (totalParcial * 12) * 0.9 : totalParcial;
  }, [selectedPlanIds, plans, formData.plano, formData.usuariosExtras, formData.valorUsuarioExtra]);

  const valorFinal = isNegotiating && Number(formData.valorNegociado) > 0 
    ? Number(formData.valorNegociado) 
    : valorTabela;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let modulosParaSalvar = quote?.modulos || [];
      if (selectedPlanIds.length > 0) {
        const planosSelecionados = plans.filter(p => selectedPlanIds.includes(p.id));
        // ✨ Usa um Set para evitar módulos duplicados caso dois planos tenham o mesmo
        const nomesEModulos = new Set<string>();
        
        planosSelecionados.forEach(p => {
          nomesEModulos.add(p.nome);
          p.modulosInclusos.forEach(m => nomesEModulos.add(m));
        });
        modulosParaSalvar = Array.from(nomesEModulos);
      }

      const payload = {
        ...formData,
        modulos: modulosParaSalvar,
        valorBase: valorTabela,
        valorNegociado: valorFinal,
        status: quote?.id ? quote.status : 'RASCUNHO' 
      };

      if (quote?.id) {
        await api.put(`/quotes/${quote.id}`, payload);
        addToast('Orçamento atualizado com sucesso!', 'success');
      } else {
        await api.post('/quotes', payload);
        addToast('Orçamento gerado com sucesso!', 'success');
      }
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Ocorreu um erro ao salvar o orçamento.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    plans,
    selectedPlanIds,
    togglePlanSelection,
    valorTabela,
    valorFinal,
    isNegotiating,
    setIsNegotiating,
    isLoading,
    handleSave,
    isReadOnly: !!quote?.id && quote.status !== 'RASCUNHO' && quote.status !== 'EM_NEGOCIACAO'
  };
}