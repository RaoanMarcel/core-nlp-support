import React, { useState } from 'react';
import { Sparkles, X, Plus, ArrowLeft } from 'lucide-react';
import { useReleaseNotes } from '../../features/Configuracoes/hooks/useReleaseNotes';
import type { CreateReleaseDTO } from '../../types/release.types';
import ReleaseList from './ReleaseList';
import ReleaseForm from './ReleaseForm';

interface WhatsNewProps {
  onClose: () => void;
}

export default function WhatsNew({ onClose }: WhatsNewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { notes, isLoading, isSubmitting, createNote } = useReleaseNotes();


  const canManageReleases = true; 

  const handleCreateSubmit = async (data: CreateReleaseDTO) => {
    const success = await createNote(data);
    if (success) {
      alert('Atualização publicada com sucesso!');
      setIsCreating(false);
    } else {
      alert('Erro ao publicar atualização.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho dinâmico */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            {isCreating ? (
              <>
                <button onClick={() => setIsCreating(false)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors mr-2">
                  <ArrowLeft size={18} className="text-slate-500" />
                </button>
                Nova Atualização
              </>
            ) : (
              <><Sparkles size={18} className="text-blue-600" /> O que há de novo?</>
            )}
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Renderiza o botão Add apenas se for Admin/Dev e não estiver já na tela de criação */}
            {!isCreating && canManageReleases && (
              <button 
                onClick={() => setIsCreating(true)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-lg transition-colors"
              >
                <Plus size={16} /> Adicionar
              </button>
            )}
            
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors ml-2">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal (Formulário ou Lista) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#f8fafc]">
          {isCreating ? (
            <ReleaseForm 
              onSubmit={handleCreateSubmit} 
              onCancel={() => setIsCreating(false)} 
              isSubmitting={isSubmitting} 
            />
          ) : (
            <ReleaseList 
              notes={notes} 
              isLoading={isLoading} 
            />
          )}
        </div>
        
      </div>
    </div>
  );
}