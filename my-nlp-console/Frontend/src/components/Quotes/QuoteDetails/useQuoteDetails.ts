import { useState } from 'react';
import type { IQuote } from '../types';

export const useQuoteDetails = (quote: IQuote, onUpdate: (fields: Partial<IQuote>) => void) => {
  // Estados Locais
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [editInteresses, setEditInteresses] = useState(false);
  const [tempInteresses, setTempInteresses] = useState(quote.interesses || '');
  const [editObs, setEditObs] = useState(false);
  const [tempObs, setTempObs] = useState(quote.observacoes || '');

  // Formatação
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  // Handlers (Ações)
  const handleCopyCnpj = async (cnpj: string) => {
    if (!cnpj) return;
    try {
      await navigator.clipboard.writeText(cnpj);
      setCopiedCnpj(true);
      setTimeout(() => setCopiedCnpj(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar CNPJ', err);
    }
  };

  const handleSaveInteresses = () => {
    onUpdate({ interesses: tempInteresses });
    setEditInteresses(false);
  };

  const handleCancelInteresses = () => {
    setTempInteresses(quote.interesses || '');
    setEditInteresses(false);
  };

  const handleSaveObs = () => {
    onUpdate({ observacoes: tempObs });
    setEditObs(false);
  };

  const handleCancelObs = () => {
    setTempObs(quote.observacoes || '');
    setEditObs(false);
  };

  // CORREÇÃO AQUI: Mudando de 'string' para IQuote['status']
  const handleStatusChange = (newStatus: IQuote['status']) => {
    onUpdate({ status: newStatus });
  };

  // Variáveis Derivadas
  const modulos = quote.modulos || ['Financeiro', 'NFe', 'Estoque', 'PDV'];
  const formattedId = String(quote.id || '0000').padStart(4, '0');
  const steps = ['RASCUNHO', 'ENVIADO', 'APROVADO'];
  const currentStepIdx = steps.indexOf(quote.status?.toUpperCase() || 'RASCUNHO');

  return {
    copiedCnpj,
    editInteresses,
    tempInteresses,
    editObs,
    tempObs,
    setTempInteresses,
    setTempObs,
    setEditInteresses,
    setEditObs,
    handleCopyCnpj,
    handleSaveInteresses,
    handleCancelInteresses,
    handleSaveObs,
    handleCancelObs,
    handleStatusChange,
    formatarMoeda,
    modulos,
    formattedId,
    steps,
    currentStepIdx,
  };
};