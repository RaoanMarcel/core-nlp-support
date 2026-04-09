// src/components/App.tsx
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard'; // O seu componente atual de Briefing
import TicketQueue from './TicketQueue'; // Nossa nova tela
import { LayoutDashboard, Inbox, Activity } from 'lucide-react';

// ==========================================
// COMPONENTE DE LAYOUT (SIDEBAR + OUTLET)
// ==========================================
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Briefing Gerencial', icon: LayoutDashboard },
    { path: '/fila', label: 'Fila de Tickets', icon: Inbox },
    { path: '/saude', label: 'Saúde da IA', icon: Activity },
  ];

  return (
    <div className="flex w-full h-screen bg-[#f8f9f9]">
      <aside className="w-56 bg-slate-950 flex flex-col shrink-0 h-full">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-extrabold text-lg tracking-tight">Core NLP</h2>
        </div>
        <nav className="p-2 flex flex-col gap-1 flex-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* Aqui a mágica do SPA acontece. O Outlet (children) muda sem piscar a tela */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}

// ==========================================
// ROTEADOR PRINCIPAL
// ==========================================
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fila" element={<TicketQueue />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}