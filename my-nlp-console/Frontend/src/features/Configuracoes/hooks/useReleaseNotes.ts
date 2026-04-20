import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { IReleaseNote, CreateReleaseDTO } from '../../../types/release.types';

export function useReleaseNotes() {
  const [notes, setNotes] = useState<IReleaseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<IReleaseNote[]>('/release-notes');
      setNotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar release notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNote = async (data: CreateReleaseDTO): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      await api.post('/release-notes', data);
      await fetchNotes(); // Atualiza a lista após criar
      return true;
    } catch (error) {
      console.error("Erro ao criar release note:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    isSubmitting,
    createNote
  };
}