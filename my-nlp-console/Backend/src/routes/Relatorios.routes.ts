import { Router } from 'express';
import { RelatorioController } from '../controllers/Relatorio.controller'; // Ajuste o caminho

const relatoriosRoutes = Router();
const relatorioController = new RelatorioController();

relatoriosRoutes.post('/build', relatorioController.build);

export { relatoriosRoutes };