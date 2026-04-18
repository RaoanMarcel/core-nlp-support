import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './SidebarLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import TicketQueue from './TicketQueue';
import Relatorios from './Relatorios';
import KnowledgeBase from './KnowledgeBase';
import Quotes from './Quotes';
import QuoteDetails from './Quotes/QuoteDetails';

// Importação corrigida: Apontando para a nova arquitetura que criamos
import ProspectList from '../features/ProspectList';

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
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/base" element={<KnowledgeBase />} />            
            <Route path="/contratos" element={<ProspectList />} />
            <Route path="/orcamentos" element={<Quotes />} />
            <Route path="/orcamentos/:id" element={<QuoteDetails />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}
    </HashRouter>
  );
}