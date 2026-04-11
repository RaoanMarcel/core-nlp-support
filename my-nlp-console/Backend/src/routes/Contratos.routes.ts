import { Router } from 'express';
import { ProspectController } from '../controllers/Contratos.controller';

const router = Router();
const prospectController = new ProspectController();

// Repare como fica muito mais limpo de ler!
router.get('/', prospectController.buscarTodos);
router.post('/importar', prospectController.importar);
router.put('/:id/travar', prospectController.travar);
router.post('/:id/finish', prospectController.finalizar);

export default router;