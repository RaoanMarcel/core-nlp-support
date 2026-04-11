import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './SidebarLayout'; 
import Login from './Login';

import Dashboard from './Dashboard';
import TicketQueue from './TicketQueue';
import Relatorios from './Relatorios';
import KnowledgeBase from './KnowledgeBase';
import Contratos from './Contratos'; 

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      {/* Passamos o handleLogout como propriedade para o Menu Lateral */}
      <AppLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fila" element={<TicketQueue />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/base" element={<KnowledgeBase />} />
          <Route path="/contratos" element={<Contratos />} />
          
          {/* Se digitar uma URL que não existe, joga pro Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}