import { Router } from 'express';
import { QuoteController } from '../controllers/Quote.controller';

const router = Router();
const quoteController = new QuoteController();

// Rotas de GET
router.get('/', quoteController.list);
router.get('/buscar', quoteController.consultar);

// Rota de POST (Novo Orçamento/Pedido)
router.post('/', quoteController.create);

// Rota de PUT (Editar/Negociar Orçamento Existente)
router.put('/:id', quoteController.update);

export default router;