import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Settings, ShieldCheck, Check } from 'lucide-react';
import WhatsNewModal from '../../components/whatsNew';
import AccessControlModal from './components/AccessControlModal';
import PlansManager from './components/PlansManager';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

export default function Configuracoes() {
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const [currentTheme, setCurrentTheme] = useState<'OCEAN' | 'MIDNIGHT' | 'COFFEE'>('OCEAN');
  const [currentShape, setCurrentShape] = useState<'SHARP' | 'MODERN' | 'SOFT'>('MODERN');

  useEffect(() => {
    const userJson = localStorage.getItem('@CRM:user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserRole(user.role ? user.role.toUpperCase() : '');
      setUserId(user.id);
      
      if (user.theme) setCurrentTheme(user.theme);
      if (user.shape) setCurrentShape(user.shape);

      socket.connect();
      socket.on(`user:${user.id}:settings_updated`, (newSettings: any) => {
        setCurrentTheme(newSettings.theme);
        setCurrentShape(newSettings.shape);
        aplicarTemaNoDOM(newSettings.theme, newSettings.shape);
        atualizarLocalStorage(newSettings.theme, newSettings.shape);
      });
    }

    return () => {
      if (userId) socket.off(`user:${userId}:settings_updated`);
    };
  }, [userId]);

  const aplicarTemaNoDOM = (theme: string, shape: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-shape', shape);
  };

  const atualizarLocalStorage = (theme: string, shape: string) => {
    const userJson = localStorage.getItem('@CRM:user');
    if (userJson) {
      const user = JSON.parse(userJson);
      user.theme = theme;
      user.shape = shape;
      localStorage.setItem('@CRM:user', JSON.stringify(user));
    }
  };

  const handleUpdatePreference = async (type: 'theme' | 'shape', value: string) => {
    if (type === 'theme') setCurrentTheme(value as any);
    if (type === 'shape') setCurrentShape(value as any);
    
    aplicarTemaNoDOM(type === 'theme' ? value : currentTheme, type === 'shape' ? value : currentShape);

    try {
      await api.patch(`/users/${userId}/settings`, { [type]: value });
      atualizarLocalStorage(type === 'theme' ? value : currentTheme, type === 'shape' ? value : currentShape);
    } catch (error) {
      console.error("Erro ao salvar preferência", error);
    }
  };

  const podeGerenciarAcessos = userRole === 'DEV' || userRole === 'DIRETORIA';
  const podeGerenciarPlanos = userRole === 'DEV' || userRole === 'DIRETORIA';
  

  return (
    <div className="flex-1 h-full bg-theme-base overflow-y-auto custom-scrollbar transition-colors duration-300 pb-20 sm:pb-0">

      {/* HEADER: Ajuste de padding e tamanhos no mobile */}
      <div className="px-4 py-6 sm:px-8 sm:py-10 border-b border-theme-border bg-theme-panel/50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-3.5 bg-theme-accent-soft text-theme-accent rounded-shape shadow-sm border border-theme-accent/20 transition-colors duration-300 shrink-0">
              <Settings size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight transition-colors duration-300">Configurações</h1>
              <p className="text-sm text-theme-muted mt-1 font-medium transition-colors duration-300 hidden sm:block">
                Gerencie suas preferências e acompanhe as atualizações da plataforma.
              </p>
            </div>
          </div>
          {/* Subtítulo visível apenas no mobile para melhor hierarquia */}
          <p className="text-sm text-theme-muted font-medium sm:hidden">
            Gerencie suas preferências e acompanhe as atualizações da plataforma.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10 space-y-8 sm:space-y-12">

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 pb-8 sm:pb-10 border-b border-theme-border transition-colors duration-300">
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black text-theme-text transition-colors duration-300">Aparência e Estilo</h2>
            <p className="text-sm text-theme-muted mt-1 sm:mt-2 leading-relaxed sm:pr-4 transition-colors duration-300">
              Personalize as cores e as bordas da interface. A alteração é salva automaticamente.
            </p>
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-3 block">Paleta de Cores</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: 'OCEAN', name: 'Ocean (Light)', bg: 'bg-slate-50', border: 'border-slate-200' },
                  { id: 'MIDNIGHT', name: 'Midnight (Dark)', bg: 'bg-slate-900', border: 'border-slate-700' },
                  { id: 'COFFEE', name: 'Coffee (Warm)', bg: 'bg-[#f5f5f0]', border: 'border-[#e7e5e4]' },
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => handleUpdatePreference('theme', t.id)}
                    className={`relative p-3 sm:p-4 rounded-shape-lg border-2 text-left transition-all ${currentTheme === t.id ? 'border-theme-accent ring-2 ring-theme-accent/20' : 'border-theme-border hover:border-slate-400'} ${t.bg}`}
                  >
                    {currentTheme === t.id && <div className="absolute top-3 right-3 text-theme-accent"><Check size={16} strokeWidth={3} /></div>}
                    <div className={`h-12 sm:h-16 rounded-shape border ${t.border} mb-2 sm:mb-3 bg-white/50 backdrop-blur-sm`}></div>
                    <span className={`text-sm font-bold ${t.id === 'MIDNIGHT' ? 'text-white' : 'text-slate-800'}`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-3 block">Estilo das Bordas</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: 'SHARP', name: 'Sharp (Reto)', radius: 'rounded-none' },
                  { id: 'MODERN', name: 'Modern (Padrão)', radius: 'rounded-md' },
                  { id: 'SOFT', name: 'Soft (Arredondado)', radius: 'rounded-3xl' },
                ].map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => handleUpdatePreference('shape', s.id)}
                    className={`p-3 sm:p-4 rounded-shape border-2 text-left bg-theme-panel transition-colors duration-300 flex items-center justify-between ${currentShape === s.id ? 'border-theme-accent text-theme-accent' : 'border-theme-border text-theme-text hover:border-slate-400'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 border-2 border-current ${s.radius}`}></div>
                      <span className="text-sm font-bold">{s.name}</span>
                    </div>
                    {currentShape === s.id && <Check size={16} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {podeGerenciarAcessos && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 pb-8 sm:pb-10 border-b border-theme-border transition-colors duration-300">
            <div className="lg:col-span-4">
              <h2 className="text-lg font-black text-theme-text transition-colors duration-300">Controle de Acessos</h2>
              <p className="text-sm text-theme-muted mt-1 sm:mt-2 leading-relaxed sm:pr-4 transition-colors duration-300">
                Gerencie cargos e defina as permissões de acesso.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-4">
              <button 
                onClick={() => setIsAccessModalOpen(true)}
                className="w-full flex items-center justify-between p-4 sm:p-5 rounded-shape-lg bg-theme-panel border border-theme-border hover:border-emerald-500/50 hover:ring-2 hover:ring-emerald-500/10 transition-all group text-left shadow-sm"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-shape bg-theme-base shadow-sm flex items-center justify-center border border-theme-border group-hover:border-emerald-500/50 group-hover:text-emerald-500 text-theme-muted transition-colors shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-theme-text group-hover:text-emerald-600 transition-colors">
                      Matriz de Permissões
                    </h4>
                    <p className="text-xs sm:text-sm text-theme-muted mt-0.5 transition-colors duration-300 line-clamp-1 sm:line-clamp-none">
                      Criar cargos e configurar acessos.
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-theme-muted group-hover:text-emerald-500 transition-colors shrink-0" />
              </button>
            </div>
          </section>
        )}

        {podeGerenciarPlanos && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 pb-8 sm:pb-10 border-b border-theme-border transition-colors duration-300">
            <div className="lg:col-span-4">
              <h2 className="text-lg font-black text-theme-text transition-colors duration-300">Planos e Serviços</h2>
              <p className="text-sm text-theme-muted mt-1 sm:mt-2 leading-relaxed sm:pr-4 transition-colors duration-300">
                Configure os valores base, limites de usuários e módulos dos planos.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-4">
              <PlansManager />
            </div>
          </section>
        )}
        
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 pb-10">
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black text-theme-text transition-colors duration-300">Sobre o Sistema</h2>
            <p className="text-sm text-theme-muted mt-1 sm:mt-2 leading-relaxed sm:pr-4 transition-colors duration-300">
              Acompanhe as últimas versões e notas de atualização.
            </p>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-4">
            <button 
              onClick={() => setIsWhatsNewModalOpen(true)}
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-shape-lg bg-theme-panel border border-theme-border hover:border-theme-accent/50 hover:ring-2 hover:ring-theme-accent/10 transition-all group text-left shadow-sm"
            >
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-shape bg-theme-base shadow-sm flex items-center justify-center border border-theme-border group-hover:border-theme-accent/50 group-hover:text-theme-accent text-theme-muted transition-colors shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-theme-text group-hover:text-theme-accent transition-colors">
                    O que há de novo?
                  </h4>
                  <p className="text-xs sm:text-sm text-theme-muted mt-0.5 transition-colors duration-300 line-clamp-1 sm:line-clamp-none">
                    Veja o histórico de atualizações recentes.
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-theme-muted group-hover:text-theme-accent transition-colors shrink-0" />
            </button>
          </div>
        </section>

      </div>

      {isWhatsNewModalOpen && <WhatsNewModal onClose={() => setIsWhatsNewModalOpen(false)} />}
      {isAccessModalOpen && <AccessControlModal onClose={() => setIsAccessModalOpen(false)} />}
      
    </div>
  );  
}