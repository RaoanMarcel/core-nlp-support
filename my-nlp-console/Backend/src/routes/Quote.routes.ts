import { Router } from 'express';
import { QuoteController } from '../controllers/Quote.controller'; 

const router = Router();
const quoteController = new QuoteController();

router.get('/', quoteController.list);
router.get('/consultar', quoteController.consultar); 

router.get('/:id', quoteController.getById); 

router.post('/', quoteController.create);

router.put('/:id', quoteController.update);
router.delete('/:id', quoteController.delete);

router.post('/:id/notas', quoteController.addNote);

export default router;