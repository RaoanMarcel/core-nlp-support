import { useState } from 'react';
import type { IQuote } from '../types';
import { QuoteService } from '../../../services/quote.service';

export const useQuoteDetails = (quote: IQuote, onUpdate: (fields: Partial<IQuote>) => void) => {
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [editInteresses, setEditInteresses] = useState(false);
  const [tempInteresses, setTempInteresses] = useState(quote.interesses || '');
  const [editObs, setEditObs] = useState(false);
  const [tempObs, setTempObs] = useState(quote.observacoes || '');
  
  const [isUpdating, setIsUpdating] = useState(false);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

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

const updateBackend = async (fields: Partial<IQuote>) => {
    setIsUpdating(true);
    try {
      await QuoteService.update(Number(quote.id), fields);
      
      onUpdate(fields);
    } catch (error) {
      console.error('Erro ao atualizar orçamento no backend:', error);
      alert('Não foi possível salvar a alteração. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveInteresses = async () => {
    await updateBackend({ interesses: tempInteresses });
    setEditInteresses(false);
  };

  const handleCancelInteresses = () => {
    setTempInteresses(quote.interesses || '');
    setEditInteresses(false);
  };

  const handleSaveObs = async () => {
    await updateBackend({ observacoes: tempObs });
    setEditObs(false);
  };

  const handleCancelObs = () => {
    setTempObs(quote.observacoes || '');
    setEditObs(false);
  };

  const handleStatusChange = async (newStatus: IQuote['status']) => {
    await updateBackend({ status: newStatus });
  };

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
    isUpdating, 
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