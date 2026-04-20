import { Router } from 'express';
import { RolesController } from '../controllers/Roles.controller';
import { authMiddleware } from '../middlewares/auth'; 
import { checkPermission } from '../middlewares/auth';

const router = Router();
const controller = new RolesController();

const roleGuard = checkPermission('roles:manage'); 

router.get('/', authMiddleware, roleGuard, controller.listar);
router.get('/permissions', authMiddleware, roleGuard, controller.listarPermissoes);

router.post('/', authMiddleware, roleGuard, controller.criar);
router.put('/:id', authMiddleware, roleGuard, controller.atualizar);
router.delete('/:id', authMiddleware, roleGuard, controller.excluir);

export default router;