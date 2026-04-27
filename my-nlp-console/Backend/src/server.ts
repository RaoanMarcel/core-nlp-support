import express from 'express';
import cors from 'cors';
import http from 'http'; 
import { Server } from 'socket.io';
import contratosRoutes from './routes/Contratos.routes';
import ordersRoutes from './routes/Quote.routes';
import orderRoutes from './routes/Order.routes';
import releaseNotesRouter from './routes/releaseNotes.routes';
import rolesRoutes from './routes/Roles.routes';
import usersRoutes from './routes/Users.routes';
import planRoutes from './routes/Plan.routes';
import { companyRoutes } from './routes/Company.routes';



const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});


app.set('io', io);

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

app.use('/auth', authRoutes);

app.use('/prospects', authMiddleware, contratosRoutes);
app.use('/relatorios', authMiddleware, relatoriosRoutes);
app.use('/quotes', authMiddleware, ordersRoutes); 
app.use('/orders', authMiddleware, orderRoutes);
app.use('/release-notes', authMiddleware, releaseNotesRouter);
app.use('/roles', authMiddleware, rolesRoutes);
app.use('/users', authMiddleware, usersRoutes);
app.use('/plans', authMiddleware, planRoutes);
app.use('/companies', authMiddleware, companyRoutes);

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Pong! Servidor acordado.' });
});
server.listen(3000, () => {
  console.log('🚀 Servidor HTTP e WebSocket rodando lindamente na porta 3000');
});