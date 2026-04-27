import { useState, useEffect, useCallback } from 'react';
import { QuoteService } from '../../../services/quote.service';
import type { IQuote } from '../types';

export function useQuoteDetails(id: string | undefined) {
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuoteDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await QuoteService.getById(Number(id));
      setQuote(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do orçamento:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]);

  return { quote, setQuote, isLoading, refetch: fetchQuoteDetails };
}