import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppLayout from './SidebarLayout'; 

import Dashboard from './Dashboard';
import TicketQueue from './TicketQueue';
import Relatorios from './Relatorios';
import KnowledgeBase from './KnowledgeBase';
import Contratos from './Contratos'; // <-- Aquele que você me mandou antes!

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* O AppLayout DEVE estar aqui, abraçando o Routes! */}
      <AppLayout>
        <Routes>
          {/* Rotas do Menu Principal */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/fila" element={<TicketQueue />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/base" element={<KnowledgeBase />} />
          
          <Route path="/contratos" element={<Contratos />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}