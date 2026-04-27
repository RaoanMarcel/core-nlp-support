import { useState } from 'react';
import { QuoteService } from '../../../services/quote.service';
import { OrderService } from '../../../services/order.service';
import type { IQuote } from '../types';

export function useQuoteActions(quote: IQuote | null, refetch: () => Promise<void>) {
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isForcingStatus, setIsForcingStatus] = useState(false);
  const [forceError, setForceError] = useState('');
  const [copiedCnpj, setCopiedCnpj] = useState(false);

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('@CRM:user');
      return userStr ? JSON.parse(userStr) : { nome: 'Sistema', login: '' };
    } catch {
      return { nome: 'Sistema', login: '' };
    }
  };

  const handleCopyCnpj = async (cnpj: string) => {
    if (!cnpj) return;
    try {
      await navigator.clipboard.writeText(cnpj.replace(/\D/g, ''));
      setCopiedCnpj(true);
      setTimeout(() => setCopiedCnpj(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar CNPJ', err);
    }
  };

  const handleSubmitNote = async (newNote: string, setQuoteLocal: React.Dispatch<React.SetStateAction<IQuote | null>>) => {
    if (!newNote.trim() || !quote?.id) return false;
    
    setIsSubmittingNote(true);
    try {
      const user = getCurrentUser();
      const novaNota = await QuoteService.addNote(Number(quote.id), newNote.trim(), user.nome);
      
      // Atualização otimista na tela
      setQuoteLocal(prev => prev ? { ...prev, notas: [novaNota, ...(prev.notas || [])] } : null);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      return false;
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleForceStatus = async (targetStatus: string, password: string) => {
    if (!password.trim() || !quote?.id) return false;
    
    setIsForcingStatus(true);
    setForceError('');
    try {
      const user = getCurrentUser();
      if (!user.nome) throw new Error('Sessão expirada');
      
      const loginParaValidar = user.login || user.nome.toLowerCase();
      await QuoteService.forceStatusUpdate(Number(quote.id), targetStatus, loginParaValidar, password);
      
      await refetch();
      return true;
    } catch (error: any) {
      setForceError(error.response?.data?.error || 'Erro ao validar senha');
      return false;
    } finally {
      setIsForcingStatus(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!quote?.id) throw new Error("O ID do orçamento não foi encontrado.");
    try {
      const response = await OrderService.gerarPedido(quote.id);
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(response.linkAssinatura);
      }
      await refetch();
      return { success: true, link: response.linkAssinatura };
    } catch (error: any) {
      throw error;
    }
  };

  return {
    isSubmittingNote,
    isForcingStatus,
    forceError,
    setForceError,
    copiedCnpj,
    handleCopyCnpj,
    handleSubmitNote,
    handleForceStatus,
    handleConfirmOrder
  };
}