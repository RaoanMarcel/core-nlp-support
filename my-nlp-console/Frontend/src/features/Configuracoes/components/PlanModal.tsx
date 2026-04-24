// Frontend/src/features/Configuracoes/components/PlanModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Loader2, PackageOpen } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useToast } from '../../../contexts/ToastContext';
import { planService } from '../../../services/plan.service';
import type { Plan, CreatePlanDTO } from '../../../types/plan.types';

interface PlanModalProps {
  onClose: () => void;
  onSuccess: () => void;
  planToEdit?: Plan | null;
}

export default function PlanModal({ onClose, onSuccess, planToEdit }: PlanModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef as React.RefObject<HTMLDivElement>, onClose);
  
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreatePlanDTO>({
    nome: '',
    modulosInclusos: [],
    quantidadeUsuarios: 1,
    descricao: '',
    valorBase: 0,
    percentualPorCnpj: 0
  });

  const [modulosInput, setModulosInput] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        nome: planToEdit.nome,
        modulosInclusos: planToEdit.modulosInclusos,
        quantidadeUsuarios: planToEdit.quantidadeUsuarios,
        descricao: planToEdit.descricao || '',
        valorBase: planToEdit.valorBase,
        percentualPorCnpj: planToEdit.percentualPorCnpj
      });
      setModulosInput(planToEdit.modulosInclusos.join(', '));
    }
  }, [planToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      addToast('O nome do plano é obrigatório.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      
      const payload: CreatePlanDTO = {
        ...formData,
        valorBase: Number(formData.valorBase),
        quantidadeUsuarios: Number(formData.quantidadeUsuarios),
        percentualPorCnpj: Number(formData.percentualPorCnpj),
        modulosInclusos: modulosInput.split(',').map(m => m.trim()).filter(m => m !== '')
      };

      if (planToEdit) {
        await planService.updatePlan(planToEdit.id, payload);
        addToast('Plano atualizado com sucesso!', 'success');
      } else {
        await planService.createPlan(payload);
        addToast('Plano criado com sucesso!', 'success');
      }
      
      onSuccess();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Erro ao salvar o plano.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-2 sm:p-6 backdrop-blur-sm bg-black/50 transition-all">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-theme-panel rounded-shape-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-theme-border"
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 border-b border-theme-border bg-theme-base/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-accent-soft text-theme-accent rounded-shape">
              <PackageOpen size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-theme-text leading-tight">
                {planToEdit ? 'Editar Plano' : 'Novo Plano'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-base rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 max-h-[80vh] overflow-y-auto custom-scrollbar p-4 sm:p-6 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Nome do Plano</label>
              <input 
                autoFocus
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Plano Enterprise"
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Descrição (Opcional)</label>
              <textarea 
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={2}
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Valor Base (R$)</label>
              <input 
                type="number"
                step="0.01"
                name="valorBase"
                value={formData.valorBase}
                onChange={handleChange}
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Qtd. Usuários</label>
              <input 
                type="number"
                name="quantidadeUsuarios"
                value={formData.quantidadeUsuarios}
                onChange={handleChange}
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Adicional por CNPJ (%)</label>
              <input 
                type="number"
                step="0.01"
                name="percentualPorCnpj"
                value={formData.percentualPorCnpj}
                onChange={handleChange}
                placeholder="50% para desconto nos CNPJs subsequentes"
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 block">Módulos Inclusos (Separados por vírgula)</label>
              <input 
                type="text"
                value={modulosInput}
                onChange={(e) => setModulosInput(e.target.value)}
                placeholder="Ex: CRM, Financeiro, Emissão Fiscal"
                className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-2.5 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-theme-border">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-theme-muted hover:bg-theme-base rounded-shape transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold bg-theme-accent text-white hover:opacity-90 rounded-shape disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}