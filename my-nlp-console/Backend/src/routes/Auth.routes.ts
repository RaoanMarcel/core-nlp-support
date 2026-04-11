import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/registrar', authController.registrar);
router.post('/primeiro-acesso', authController.alterarSenhaPrimeiroAcesso); 

export default router;