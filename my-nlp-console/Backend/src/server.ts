import express from 'express';
import cors from 'cors';
import contratosRoutes from './routes/Contratos.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Injetando as rotas limpas!
app.use('/prospects', contratosRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando lindamente na porta 3000');
});