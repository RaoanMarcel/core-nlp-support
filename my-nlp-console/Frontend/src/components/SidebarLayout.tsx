import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  LayoutDashboard, 
  Inbox, 
  Settings, 
  Menu, 
  X,
  BookOpen,
  FileText,
  LogOut, 
  Calculator,
  Building2 // <-- NOVO ÍCONE IMPORTADO AQUI
} from 'lucide-react';

import logoSvg from '../assets/logo.svg?url';

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

  const userStr = localStorage.getItem('@CRM:user');
  const currentUser = userStr ? JSON.parse(userStr) : { nome: 'Usuário', role: 'Visitante', permissions: [] };
  const iniciais = currentUser.nome ? currentUser.nome.substring(0, 2).toUpperCase() : 'US';

  // FUNÇÃO QUE CHECA PERMISSÃO PARA O MENU
  const hasMenuPermission = (requiredPermission?: string) => {
    if (!requiredPermission) return true; // Se não exigir permissão, libera
    if (currentUser.role === 'DEV') return true; // DEV vê tudo
    return currentUser.permissions?.includes(requiredPermission);
  };

  const navItems = [
    { path: '/', label: 'Briefing Gerencial', icon: LayoutDashboard },
    { path: '/fila', label: 'Fila de Tickets', icon: Inbox },
    { path: '/base', label: 'Base Interna', icon: BookOpen },
    { path: '/companies', label: 'Empresas', icon: Building2, requiredPermission: 'companies:view' },
    { path: '/contratos', label: 'Prospecção', icon: FileText, requiredPermission: 'prospects:view' }, 
    { path: '/orcamentos', label: 'Orçamentos', icon: Calculator, requiredPermission: 'quotes:view' }, 
    { path: '/relatorios', label: 'Geração de Relatórios', icon: SlidersHorizontal},
  ];

  const visibleNavItems = navItems.filter(item => hasMenuPermission(item.requiredPermission));

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-theme-base text-theme-text overflow-hidden font-sans relative transition-colors">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden flex items-center justify-between bg-theme-panel border-b border-theme-border h-16 px-4 shrink-0 shadow-sm z-30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center shadow-md overflow-hidden transition-colors">
            <img src={logoSvg as string} alt="AutoDesk Logo" className="w-5 h-5 object-contain" />
          </div>
          <h1 className="font-black text-theme-text text-lg transition-colors">AutoDesk</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-theme-muted hover:text-theme-text transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* BARRA LATERAL */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full bg-theme-panel border-r border-theme-border flex flex-col z-50 
        transition-all duration-300 ease-in-out shrink-0 shadow-lg md:shadow-none group
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        md:translate-x-0 md:w-19 hover:md:w-64
      `}>
        
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-4 text-theme-muted hover:text-theme-text md:hidden transition-colors"
        >
          <X size={24} />
        </button>

        <div className="h-20 flex items-center px-5 shrink-0 border-b border-theme-border whitespace-nowrap mt-4 md:mt-0 transition-colors">
          <div className="w-9 h-9 bg-theme-accent rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden transition-colors">
            <img src={logoSvg as string} alt="AutoDesk Logo" className="w-5 h-5 object-contain" />
          </div>
          <div className="ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:delay-75">
            <h1 className="text-lg font-black text-theme-text leading-tight transition-colors">AutoDesk</h1>
            <p className="text-[10px] font-bold text-theme-accent uppercase tracking-widest transition-colors">Interplace</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col gap-2 px-3 overflow-x-hidden">
          <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 px-3 whitespace-nowrap">
            Menu Principal
          </p>

          {/* RENDERIZA APENAS OS MENUS PERMITIDOS */}
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive 
                    ? 'bg-theme-accent/10 text-theme-accent' 
                    : 'text-theme-muted hover:bg-theme-base hover:text-theme-text'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="p-4 border-t border-theme-border shrink-0 whitespace-nowrap flex flex-col transition-colors">
          
          <Link 
            to="/configuracoes"
            className="w-full flex items-center gap-4 px-2 py-2 mb-2 rounded-xl text-theme-muted hover:bg-theme-base hover:text-theme-text font-bold transition-all whitespace-nowrap cursor-pointer text-left"
          >
            <Settings size={22} className="shrink-0" />
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-sm">Configurações</span>
          </Link>

          {/* Botão de sair mantido com cores próprias (rose) por ser ação destrutiva */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-2 py-2 mb-4 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 font-bold transition-all whitespace-nowrap cursor-pointer text-left"
          >
            <LogOut size={22} className="shrink-0" />
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-sm">Sair do Sistema</span>
          </button>

          {/* PERFIL DO USUÁRIO */}
          <div className="flex items-center gap-4 px-2 py-2 mt-2 bg-theme-base border border-theme-border rounded-xl transition-colors">
            <div className="w-8 h-8 shrink-0 rounded-full bg-theme-panel flex items-center justify-center text-theme-text font-bold text-xs border border-theme-border transition-colors">
              {iniciais}
            </div>
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-bold text-theme-text leading-tight capitalize truncate max-w-30 transition-colors">
                {currentUser.nome}
              </p>
              <p className="text-[10px] font-semibold text-theme-muted uppercase mt-0.5 transition-colors">
                {currentUser.role || 'Usuário'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-theme-base transition-colors">
        {children}
      </main>
    </div>
  );
}