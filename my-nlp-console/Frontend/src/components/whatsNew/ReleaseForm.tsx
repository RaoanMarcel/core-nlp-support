import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { CreateReleaseDTO } from '../../types/release.types';

interface ReleaseFormProps {
  onSubmit: (data: CreateReleaseDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ReleaseForm({ onSubmit, onCancel, isSubmitting }: ReleaseFormProps) {
  const [formData, setFormData] = useState<CreateReleaseDTO>({
    versao: '', titulo: '', descricao: '', categoria: 'NOVIDADE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Quebra o grid em mobile (grid-cols-1) e usa 2 colunas em telas maiores (sm:grid-cols-2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-sm font-bold text-theme-text mb-1">Versão</label>
          <input 
            type="text" placeholder="Ex: 1.2.0" required
            className="w-full p-3 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-shape focus:ring-2 focus:ring-theme-accent focus:border-theme-accent outline-none transition-all"
            value={formData.versao} onChange={e => setFormData({...formData, versao: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-theme-text mb-1">Categoria</label>
          <select 
            className="w-full p-3 bg-theme-base border border-theme-border text-theme-text rounded-shape focus:ring-2 focus:ring-theme-accent focus:border-theme-accent outline-none font-medium transition-all"
            value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as CreateReleaseDTO['categoria']})}
          >
            <option value="NOVIDADE" className="bg-theme-panel">Novidade</option>
            <option value="MELHORIA" className="bg-theme-panel">Melhoria</option>
            <option value="FIX" className="bg-theme-panel">Correção (Fix)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-theme-text mb-1">Título</label>
        <input 
          type="text" placeholder="Ex: Nova funcionalidade de busca" required
          className="w-full p-3 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-shape focus:ring-2 focus:ring-theme-accent focus:border-theme-accent outline-none transition-all"
          value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-theme-text mb-1">Descrição</label>
        <textarea 
          rows={4} placeholder="Descreva os detalhes desta atualização..." required
          className="w-full p-3 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-shape focus:ring-2 focus:ring-theme-accent focus:border-theme-accent outline-none resize-none transition-all"
          value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
        />
      </div>
      
      {/* Botões full-width no mobile, com o botão primário no topo da zona de toque */}
      <div className="pt-4 border-t border-theme-border flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting} 
          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-theme-muted font-bold hover:text-theme-text hover:bg-theme-base rounded-shape transition-colors text-center"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-theme-accent hover:opacity-90 text-white font-bold px-6 py-3 sm:py-2.5 rounded-shape disabled:opacity-70 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Publicar</>}
        </button>
      </div>
    </form>
  );
}