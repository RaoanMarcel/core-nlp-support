// src/components/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Activity, Settings, LifeBuoy } from 'lucide-react';

import Dashboard from './Dashboard';
import TicketQueue from './TicketQueue';
// import SaudeIA from './SaudeIA'; // Caso já tenha esse componente

// ==========================================
// COMPONENTE DE LAYOUT GLOBAL (SIDEBAR + OUTLET)
// ==========================================
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Briefing Gerencial', icon: LayoutDashboard },
    { path: '/fila', label: 'Fila de Tickets', icon: Inbox },
    { path: '/saude', label: 'Saúde da IA', icon: Activity },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f4f5f7] overflow-hidden font-sans">
      
      {/* ========================================================
        BARRA LATERAL RETRÁTIL (Ativada por Hover CSS)
        ========================================================
      */}
      <aside className="group h-full bg-[#0a1128] flex flex-col z-40 transition-all duration-300 ease-in-out w-[76px] hover:w-[260px] overflow-hidden shrink-0 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Logo Area */}
        <div className="h-[80px] flex items-center px-5 shrink-0 border-b border-slate-800/60 whitespace-nowrap">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <LifeBuoy size={20} className="text-white" />
          </div>
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            <h1 className="text-lg font-black text-white leading-tight">AutoDesk</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Core NLP</p>
          </div>
        </div>

        {/* Navigation Links via React Router */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col gap-2 px-3 overflow-x-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 whitespace-nowrap">
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
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Configurações</span>
          </button>

          <div className="flex items-center gap-4 px-2 py-2 mt-2">
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-600">
              US
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-bold text-white leading-tight">Admin</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Gestor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
        ÁREA PRINCIPAL (OUTLET DO REACT ROUTER)
        ========================================================
      */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f5f7]">
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
          {/* <Route path="/saude" element={<SaudeIA />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}