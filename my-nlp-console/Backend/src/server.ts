import express from 'express';
import cors from 'cors';
import contratosRoutes from './routes/Contratos.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/prospects', contratosRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando lindamente na porta 3000');
});