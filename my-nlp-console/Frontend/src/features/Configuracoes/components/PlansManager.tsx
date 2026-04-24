// Frontend/src/features/Configuracoes/components/PlansManager.tsx
import React, { useState, useEffect } from 'react';
import { PackageOpen, Search, Plus, Edit2, Loader2 } from 'lucide-react';
import { planService } from '../../../services/plan.service';
import type { Plan } from '../../../types/plan.types';
import PlanModal from './PlanModal';
import { useToast } from '../../../contexts/ToastContext';

export default function PlansManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  
  const { addToast } = useToast();

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await planService.getPlans(searchTerm);
      setPlans(data);
    } catch (error) {
      console.error(error);
      addToast('Erro ao carregar a lista de planos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPlans();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setPlanToEdit(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-theme-panel border border-theme-border rounded-shape-lg overflow-hidden shadow-sm transition-colors duration-300">
      <div className="p-4 sm:p-5 border-b border-theme-border flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-theme-base/30">
        
        {/* ÍCONE PADRONIZADO E TÍTULO SEM QUEBRA DE LINHA */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-shape bg-theme-base shadow-sm flex items-center justify-center border border-theme-border text-theme-muted hover:text-theme-accent transition-colors shrink-0">
            <PackageOpen size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-theme-text whitespace-nowrap">Planos e Serviços</h3>
            <p className="text-xs sm:text-sm text-theme-muted mt-0.5 line-clamp-1 sm:line-clamp-none">
              Gerencie as assinaturas e pacotes ofertados.
            </p>
          </div>
        </div>

        {/* BUSCA REDUZIDA E BOTÕES */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-48 md:w-56">
            <input 
              type="text"
              placeholder="Buscar plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-theme-base border border-theme-border rounded-shape text-sm text-theme-text focus:ring-2 focus:ring-theme-accent outline-none transition-all"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-theme-muted" />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-theme-accent text-white px-4 py-2 rounded-shape font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm shrink-0"
          >
            <Plus size={16} /> Novo Plano
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-175">
          <thead>
            <tr className="bg-theme-base text-theme-muted text-xs uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-theme-border">Nome</th>
              <th className="p-4 font-bold border-b border-theme-border text-center">Usuários</th>
              <th className="p-4 font-bold border-b border-theme-border">Valor Base</th>
              <th className="p-4 font-bold border-b border-theme-border text-center">Adicional CNPJ</th>
              <th className="p-4 font-bold border-b border-theme-border text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-theme-muted">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-theme-accent mb-2" />
                  Buscando planos...
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-theme-muted text-sm">
                  Nenhum plano encontrado.
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id} className="hover:bg-theme-base/50 transition-colors group">
                  <td className="p-4 text-sm font-bold text-theme-text">
                    {plan.nome}
                    {plan.modulosInclusos.length > 0 && (
                      <div className="text-[10px] text-theme-muted font-normal mt-1 truncate max-w-xs">
                        {plan.modulosInclusos.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-theme-text text-center font-medium">
                    {plan.quantidadeUsuarios}
                  </td>
                  <td className="p-4 text-sm text-emerald-600 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.valorBase)}
                  </td>
                  <td className="p-4 text-sm text-theme-text text-center">
                    {plan.percentualPorCnpj}%
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 text-theme-muted hover:text-theme-accent hover:bg-theme-accent/10 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PlanModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPlans();
          }} 
          planToEdit={planToEdit} 
        />
      )}
    </div>
  );
}