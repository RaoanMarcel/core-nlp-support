import React, { useState } from 'react';
import { Sparkles, ChevronRight, Settings, Palette } from 'lucide-react';
import WhatsNewModal from '../../components/whatsNew';

export default function Configuracoes() {
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto custom-scrollbar">
      
      {/* ==========================================
          HEADER DA PÁGINA (Full Width)
          ========================================== */}
      <div className="px-8 py-10 border-b border-slate-200/60 bg-slate-50/50">
        <div className="max-w-5xl mx-auto flex items-center gap-5">
          <div className="p-3.5 bg-blue-100/50 text-blue-600 rounded-2xl shadow-sm border border-blue-100">
            <Settings size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Gerencie suas preferências e acompanhe as atualizações da plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          CONTEÚDO DAS CONFIGURAÇÕES
          ========================================== */}
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-12">
        
        {/* SEÇÃO: SISTEMA & NOVIDADES */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          
          {/* Coluna da Esquerda: Descrição */}
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black text-slate-900">Sobre o Sistema</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed pr-4">
              Acompanhe as últimas versões, leia as notas de atualização e mantenha-se por dentro do que há de novo na plataforma.
            </p>
          </div>
          
          {/* Coluna da Direita: Ações */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            <button 
              onClick={() => setIsWhatsNewModalOpen(true)}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-blue-50 hover:border-blue-200 hover:ring-2 hover:ring-blue-100 hover:ring-offset-2 transition-all group text-left shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 group-hover:border-blue-300 group-hover:text-blue-600 text-slate-500 transition-colors shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    O que há de novo?
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Veja o histórico de atualizações, melhorias e correções recentes.
                  </p>
                </div>
              </div>
              <ChevronRight size={22} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
            </button>

          </div>
        </section>

        {/* SEÇÃO: APARÊNCIA (Exemplo para dar corpo à página) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
          
          {/* Coluna da Esquerda: Descrição */}
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black text-slate-900">Aparência</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed pr-4">
              Personalize a interface do sistema para se adequar ao seu estilo e ambiente de trabalho.
            </p>
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            <div className="w-full flex items-center justify-between p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 opacity-70 cursor-not-allowed">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-700">Preferências de Tema</h4>
                  <p className="text-sm text-slate-500 mt-0.5">Modo noturno e temas personalizados chegarão em breve.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>

      {isWhatsNewModalOpen && (
        <WhatsNewModal onClose={() => setIsWhatsNewModalOpen(false)} />
      )}
      
    </div>
  );
}