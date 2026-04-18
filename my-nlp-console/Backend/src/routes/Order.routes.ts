import { Router } from 'express';
import { OrderController } from '../controllers/Order.controller';
import { authMiddleware } from '../middlewares/auth'; // Confirma se o caminho do teu middleware está correto

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post('/gerar', authMiddleware, orderController.gerarPedido);


orderRoutes.get('/publico/:token', orderController.buscarDadosTermo);

orderRoutes.post('/publico/:token/assinar', orderController.assinarPedido);

export default orderRoutes;