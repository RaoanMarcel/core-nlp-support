import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { IQuote } from './types';
import { MODULOS_DISPONIVEIS } from './utils';

export function useQuoteModal(quote: IQuote | null, onClose: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cnpj: '',
    endereco: '',
    email: '',
    telefonePrincipal: '',
    interesses: '', 
    observacoes: '',
    plano: 'MENSAL' as 'MENSAL' | 'ANUAL',
    valorNegociado: 0 
  });
  
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);
  const [isNegotiating, setIsNegotiating] = useState(false); 

  useEffect(() => {
    if (quote) {
      setFormData({
        nomeCliente: quote.nomeCliente || '',
        cnpj: quote.cnpj || '',
        endereco: quote.endereco || '',
        email: quote.email || '',
        telefonePrincipal: quote.telefonePrincipal || '',
        interesses: quote.interesses || '',
        observacoes: quote.observacoes || '',
        plano: quote.plano,
        valorNegociado: quote.valorNegociado || quote.valorBase
      });
      setSelectedModulos(quote.modulos || []);
      if (quote.valorNegociado !== quote.valorBase) setIsNegotiating(true);
    }
  }, [quote]);

  // Cálculo Automático da Tabela (Base)
  const valorTabela = useMemo(() => {
    const base = MODULOS_DISPONIVEIS
      .filter(m => selectedModulos.includes(m.id))
      .reduce((acc, curr) => acc + curr.valorBase, 0);
      
    return formData.plano === 'ANUAL' ? (base * 12) * 0.9 : base; 
  }, [selectedModulos, formData.plano]);

  // Valor Final que será salvo (Tabela ou Negociado)
  const valorFinal = isNegotiating && formData.valorNegociado > 0 
    ? formData.valorNegociado 
    : valorTabela;

  const handleToggleModulo = (id: string) => {
    setSelectedModulos(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        modulos: selectedModulos,
        valorBase: valorTabela,
        valorNegociado: valorFinal,
        status: quote?.id ? quote.status : 'RASCUNHO' 
      };

      if (quote?.id) {
        await api.put(`/quotes/${quote.id}`, payload);
      } else {
        await api.post('/quotes', payload);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao salvar orçamento:", err);
      alert("Ocorreu um erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    selectedModulos,
    handleToggleModulo,
    valorTabela,
    valorFinal,
    isNegotiating,
    setIsNegotiating,
    isLoading,
    handleSave,
    isReadOnly: !!quote?.id && quote.status !== 'RASCUNHO' && quote.status !== 'EM_NEGOCIACAO'
  };
}