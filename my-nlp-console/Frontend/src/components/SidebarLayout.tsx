import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  LayoutDashboard, 
  Inbox, 
  Settings, 
  LifeBuoy, 
  Menu, 
  X,
  BookOpen,
  FileText,
  LogOut // <-- 1. Importamos o ícone de Sair
} from 'lucide-react';

// 2. Definimos que o AppLayout agora aceita a função de deslogar
interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void; 
}

export default function AppLayout({ children, onLogout }: AppLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Briefing Gerencial', icon: LayoutDashboard },
    { path: '/fila', label: 'Fila de Tickets', icon: Inbox },
    { path: '/relatorios', label: 'Geração de Relatórios', icon: SlidersHorizontal },
    { path: '/base', label: 'Base Interna', icon: BookOpen },
    { path: '/contratos', label: 'Contratos', icon: FileText }, 
  ];

  // Pegamos o nome do usuário logado para mostrar no menu!
  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : { nome: 'Admin', role: 'Gestor' };
  const iniciais = currentUser.nome ? currentUser.nome.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f5f7] overflow-hidden font-sans relative">
      
      {/* TOP BAR MOBILE */}
      <div className="md:hidden flex items-center justify-between bg-[#0a1128] h-16 px-4 shrink-0 shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <LifeBuoy size={16} className="text-white" />
          </div>
          <h1 className="font-black text-white text-lg">AutoDesk</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-300 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY ESCURO MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* BARRA LATERAL */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full bg-[#0a1128] flex flex-col z-50 
        transition-all duration-300 ease-in-out shrink-0 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.5)] group
        ${isMobileMenuOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]'}
        md:translate-x-0 md:w-[76px] hover:md:w-[260px]
      `}>
        
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-4 text-slate-400 hover:text-white md:hidden"
        >
          <X size={24} />
        </button>

        {/* Logo Area */}
        <div className="h-[80px] flex items-center px-5 shrink-0 border-b border-slate-800/60 whitespace-nowrap mt-4 md:mt-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <LifeBuoy size={20} className="text-white" />
          </div>
          <div className="ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:delay-75">
            <h1 className="text-lg font-black text-white leading-tight">AutoDesk</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Core NLP</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col gap-2 px-3 overflow-x-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 px-3 whitespace-nowrap">
            Menu Principal
          </p>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={22} className="shrink-0" />
                <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area / User */}
        <div className="p-4 border-t border-slate-800/60 shrink-0 whitespace-nowrap">
          <button className="w-full flex items-center gap-4 px-2 py-2 mb-2 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white font-bold transition-all whitespace-nowrap cursor-pointer text-left">
            <Settings size={22} className="shrink-0" />
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-sm">Configurações</span>
          </button>
          
          {/* 3. BOTÃO DE SAIR */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-2 py-2 mb-4 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold transition-all whitespace-nowrap cursor-pointer text-left"
          >
            <LogOut size={22} className="shrink-0" />
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-sm">Sair do Sistema</span>
          </button>

          <div className="flex items-center gap-4 px-2 py-2 mt-2 bg-slate-800/30 rounded-xl">
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-600">
              {iniciais}
            </div>
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-bold text-white leading-tight capitalize">{currentUser.nome}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">{currentUser.role || 'Usuário'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f5f7]">
        {children}
      </main>

    </div>
  );
}