import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import  type { CreateReleaseDTO } from '../../types/release.types';

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
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Versão</label>
          <input 
            type="text" placeholder="Ex: 1.2.0" required
            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.versao} onChange={e => setFormData({...formData, versao: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
          <select 
            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as CreateReleaseDTO['categoria']})}
          >
            <option value="NOVIDADE">✨ Novidade</option>
            <option value="MELHORIA">📈 Melhoria</option>
            <option value="FIX">🔧 Correção (Fix)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
        <input 
          type="text" placeholder="Ex: Nova funcionalidade de busca" required
          className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
        <textarea 
          rows={4} placeholder="Descreva os detalhes desta atualização..." required
          className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
        />
      </div>
      <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-70 transition-colors">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Publicar</>}
        </button>
      </div>
    </form>
  );
}