import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext'; 
import AppLayout from './components/SidebarLayout';
import Dashboard from './components/Dashboard';
import TicketQueue from './components/TicketQueue';
import KnowledgeBase from './components/KnowledgeBase';
import ProspectList from './features/ProspectList';
import Login from './features/Auth/Login';
import Relatorios from './features/Reports';
import QuoteDetails from './features/Quotes/QuoteDetails';
import Quotes from './features/Quotes';
import Configuracoes from './features/Configuracoes'; 
import Companies from './features/Companies'; // <-- NOVA IMPORTAÇÃO AQUI

const RotaProtegida = ({ children, permissaoNecessaria }: { children: React.ReactNode, permissaoNecessaria: string }) => {
  const userStr = localStorage.getItem('@CRM:user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || (user.role !== 'DEV' && !user.permissions?.includes(permissaoNecessaria))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('@CRM:token');
    const userStr = localStorage.getItem('@CRM:user'); 

    if (token) {
      setIsAuthenticated(true);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.theme) document.documentElement.setAttribute('data-theme', user.theme);
        if (user.shape) document.documentElement.setAttribute('data-shape', user.shape);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    setIsAuthenticated(true);
    if (user.theme) document.documentElement.setAttribute('data-theme', user.theme);
    if (user.shape) document.documentElement.setAttribute('data-shape', user.shape);
  };

  const handleLogout = () => {
    localStorage.removeItem('@CRM:token');
    localStorage.removeItem('@CRM:user');
    setIsAuthenticated(false);
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-shape');
  };

  return (
    <ToastProvider>
      <HashRouter>
        {isLoading ? (
          <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AppLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fila" element={<TicketQueue />} />
              <Route path="/base" element={<KnowledgeBase />} />            
              
              <Route path="/configuracoes" element={<Configuracoes />} />

              {/* NOVA ROTA DE COMPANHIAS PROTEGIDA */}
              <Route 
                path="/companies" 
                element={
                  <RotaProtegida permissaoNecessaria="companies:view">
                    <Companies />
                  </RotaProtegida>
                } 
              />

              <Route 
                path="/orcamentos" 
                element={
                  <RotaProtegida permissaoNecessaria="quotes:view">
                    <Quotes />
                  </RotaProtegida>
                } 
              />
              
              <Route 
                path="/orcamentos/:id" 
                element={
                  <RotaProtegida permissaoNecessaria="quotes:view">
                    <QuoteDetails />
                  </RotaProtegida>
                } 
              />

              <Route 
                path="/contratos" 
                element={
                  <RotaProtegida permissaoNecessaria="prospects:view">
                    <ProspectList />
                  </RotaProtegida>
                } 
              />
              <Route 
                path="/relatorios" 
                element={<Relatorios />} 
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        )}
      </HashRouter>
    </ToastProvider>
  );
}