🎫 Sistema de Fila de Atendimento (Ticket Queue UI)
Um componente React moderno e responsivo para gerenciamento de tickets de suporte corporativo. O sistema oferece uma interface de tela dividida (inbox/chat/detalhes), resumo inteligente de interações via IA, linha do tempo detalhada e painel de metadados.
✨ Funcionalidades
Fila de Tickets (Inbox): Listagem de tickets com indicadores visuais de SLA (Aviso/Crítico), busca e suporte a filtros.
Design Responsivo: Adaptação perfeita para dispositivos móveis, alternando perfeitamente entre a visão da fila e o chat ativo.
Chat Interativo:
Linha do tempo cronológica mesclando mensagens de usuários e logs/eventos de sistema (auditoria).
Caixa de destaque com Resumo da Triagem IA.
Editor de respostas com opções para anexar arquivos (Novo!) e sugerir respostas com IA.
Painel de Metadados (Desktop): Sidebar lateral contendo atributos editáveis do ticket (Status, Prioridade, Responsável, Setor) e listagem de anexos para download.
🛠️ Tecnologias Utilizadas
Este projeto foi construído utilizando as seguintes tecnologias:
React: Biblioteca principal para construção da interface.
Tailwind CSS: Framework utilitário para a estilização rápida e responsiva.
Lucide React: Biblioteca de ícones modernos e limpos.
React Router DOM: Para gerenciamento de rotas e passagem de estados (useLocation).
🚀 Como executar o projeto
Pré-requisitos
Antes de começar, você precisará ter o Node.js instalado em sua máquina.
Instalação
Clone este repositório:
Bash
 
git clone https://github.com/seu-usuario/seu-repositorio.git
Acesse a pasta do projeto:
Bash
 
cd seu-repositorio
Instale as dependências:
Bash
 
npm install# ouyarn install
Instale as dependências específicas do componente (caso ainda não estejam no seu package.json):
Bash
 
npm install lucide-react react-router-dom
Inicie o servidor de desenvolvimento:
Bash
 
npm start# ouyarn start# ou (se estiver usando Vite)npm run dev
🧩 Como usar o componente
Para utilizar o componente TicketQueue em sua aplicação principal, basta importá-lo e adicioná-lo à sua rota:
JavaScript
 
import { BrowserRouter, Routes, Route } from 'react-router-dom';import TicketQueue from './caminho/para/TicketQueue';
function App() {
  return (
    <BrowserRouter><Routes><Route path="/atendimento" element={<TicketQueue />} />
      </Routes></BrowserRouter>  );
}
export default App;
Nota: O componente suporta receber o ID de um ticket via location.state (ex: Maps('/atendimento', { state: { selectedTicketId: '#1047' } })) para já abrir um ticket específico, ideal para redirecionamentos de dashboards.
🚧 Próximos Passos / Melhorias Futuras
[ ] Integrar com uma API real (atualmente usa mockTickets).
[ ] Implementar a lógica funcional da busca e dos filtros de tickets.
[ ] Adicionar funcionalidade real de upload de arquivos no botão de anexo.
[ ] Implementar os menus dropdown para alteração de Status, Prioridade e Responsável.
 
React
React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components written in JavaScript. React is designed to let you seamlessly combine comp...
 