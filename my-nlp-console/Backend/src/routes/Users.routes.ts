import { Router } from 'express';
import { UsersController } from '../controllers/Users.controller';

const router = Router();
const usersController = new UsersController();

router.get('/', usersController.listar);
router.put('/:id/role', usersController.atribuirCargo);

export default router;