import { useState } from 'react';
import { api } from '../../../services/api';

export interface ImportResult {
  success: boolean;
  importados: number;
  atualizados: number;
}

export function useProspectImportes() {
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importarClientes = async (clientes: any[]) => {
    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      // O frontend dispara o payload limpo para a sua rota Astro (ou Node).
      // A instância 'api' já deve ter a baseURL e interceptors configurados.
      const response = await api.post('/api/ImportarClientes', { clientes });
      
      const data = response.data;
      setImportResult({
        success: data.success,
        importados: data.importados,
        atualizados: data.atualizados,
      });

      return data;
    } catch (err: any) {
      // Captura implacável de erros
      const errorMessage = err.response?.data?.error || err.message || 'Erro sinistro ao importar clientes.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setImportResult(null);
    setError(null);
  };

  return { 
    importarClientes, 
    isImporting, 
    importResult, 
    error,
    resetState
  };
}