import { Router } from 'express';
import { PlanController } from '../controllers/Plan.controller';

const router = Router();
const planController = new PlanController();

router.get('/', planController.list);
router.get('/:id', planController.getById);
router.post('/', planController.create);
router.put('/:id', planController.update);

export default router;