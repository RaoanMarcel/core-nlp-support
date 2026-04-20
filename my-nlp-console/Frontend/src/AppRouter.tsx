import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('@CRM:token');
    localStorage.removeItem('@CRM:user');
    setIsAuthenticated(false);
  };

  return (
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
            
            {/* Rota aberta para todos editarem o próprio perfil */}
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* ROTAS PROTEGIDAS NA URL */}
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
              element={
                <RotaProtegida permissaoNecessaria="reports:view">
                  <Relatorios />
                </RotaProtegida>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}
    </HashRouter>
  );
}