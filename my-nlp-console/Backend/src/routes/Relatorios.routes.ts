import { Router } from 'express';
import { RelatorioController } from '../controllers/Relatorio.controller';
import { checkPermission } from '../middlewares/auth'; 

const relatoriosRoutes = Router();
const relatorioController = new RelatorioController();

relatoriosRoutes.post('/build', checkPermission('reports:view'), relatorioController.build);

export { relatoriosRoutes };