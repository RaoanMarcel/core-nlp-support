import { Router } from 'express';
import { QuoteController } from '../controllers/Quote.controller'; // Ajuste o caminho se necessário

const router = Router();
const quoteController = new QuoteController();

// 1. Rotas de Listagem e Busca (GET)
router.get('/', quoteController.list);
router.get('/consultar', quoteController.consultar); // Tem que vir antes do /:id

// 2. Rota de Detalhes Específicos (GET)
router.get('/:id', quoteController.getById); // Essencial para a tela de detalhes

// 3. Rota de Criação (POST)
router.post('/', quoteController.create);

// 4. Rotas de Edição e Exclusão (PUT, DELETE)
router.put('/:id', quoteController.update);
router.delete('/:id', quoteController.delete);

export default router;