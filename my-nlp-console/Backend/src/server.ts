import express from 'express';
import cors from 'cors';
import http from 'http'; // <-- Import nativo do Node
import { Server } from 'socket.io'; // <-- Import do Socket.io
import contratosRoutes from './routes/Contratos.routes';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Em produção, você limitará isso para a URL do front
    methods: ['GET', 'POST', 'PUT']
  }
});


app.set('io', io);

// Opcional: Apenas para logar quem entrou
io.on('connection', (socket) => {
  console.log(`🟢 Usuário conectado no Socket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔴 Usuário desconectado: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import authRoutes from './routes/Auth.routes';
import { authMiddleware } from './middlewares/auth';
import { relatoriosRoutes } from './routes/Relatorios.routes';



// Rotas públicas
app.use('/auth', authRoutes);

// Rotas Protegidas (Exige Token!)
app.use('/prospects', authMiddleware, contratosRoutes);
app.use('/relatorios', authMiddleware, relatoriosRoutes);

server.listen(3000, () => {
  console.log('🚀 Servidor HTTP e WebSocket rodando lindamente na porta 3000');
});