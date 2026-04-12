import { Router } from 'express';
import { ProspectController } from '../controllers/Contratos.controller';

const router = Router();
const prospectController = new ProspectController();

router.get('/', prospectController.buscarTodos);
router.post('/importar', prospectController.importar);
router.put('/:id/travar', prospectController.travar);
router.post('/:id/finish', prospectController.finalizar);

router.patch('/:id/update', prospectController.atualizar);

export default router;