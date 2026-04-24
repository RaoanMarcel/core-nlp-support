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
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [formData, setFormData] = useState({
    nomeCliente: '',
    cnpj: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    email: '',
    telefonePrincipal: '',
    telefoneSecundario: '',
    interesses: '', 
    observacoes: '',
    plano: 'MENSAL' as 'MENSAL' | 'ANUAL',
    usuariosExtras: 0,
    valorUsuarioExtra: 0, 
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
        cep: quote.cep || '',               
        logradouro: quote.logradouro || '', 
        numero: quote.numero || '',         
        complemento: quote.complemento || '',
        bairro: quote.bairro || '',         
        cidade: quote.cidade || '',         
        uf: quote.uf || '',
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

  useEffect(() => {
    if (quote && plans.length > 0 && quote.modulos?.length > 0) {
      const matchedIds = plans
        .filter(p => quote.modulos.includes(p.nome))
        .map(p => p.id);
      setSelectedPlanIds(matchedIds);
    }
  }, [quote, plans]);

  const togglePlanSelection = (planId: string) => {
    setSelectedPlanIds(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : [...prev, planId]
    );
  };

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

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj?.replace(/\D/g, '');
    if (!cnpjLimpo || cnpjLimpo.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        nomeCliente: data.razao_social || data.nome_fantasia || prev.nomeCliente,
        telefonePrincipal: data.ddd_telefone_1 || prev.telefonePrincipal,
        email: data.email || prev.email,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      alert("CNPJ não encontrado ou indisponível no momento.");
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const buscarCEP = async (cepParaBuscar: string) => {
    const cepLimpo = cepParaBuscar.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`);
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        logradouro: data.street || prev.logradouro,
        bairro: data.neighborhood || prev.bairro,
        cidade: data.city || prev.cidade,
        uf: data.state || prev.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let modulosParaSalvar = quote?.modulos || [];
      if (selectedPlanIds.length > 0) {
        const planosSelecionados = plans.filter(p => selectedPlanIds.includes(p.id));
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
    isLoadingCnpj, 
    isLoadingCep,
    buscarCNPJ,
    buscarCEP,    
    handleSave,
    isReadOnly: !!quote?.id && quote.status !== 'RASCUNHO' && quote.status !== 'EM_NEGOCIACAO'
  };
}