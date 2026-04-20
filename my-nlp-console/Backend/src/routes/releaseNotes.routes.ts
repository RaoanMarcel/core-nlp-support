import { Router } from 'express';
import { ReleaseNotesController } from '../controllers/ReleaseNotes.controller';
import { authMiddleware } from '../middlewares/auth';
import { checkPermission } from '../middlewares/auth'; 

const router = Router();
const releaseNotesController = new ReleaseNotesController();

router.get('/', authMiddleware, releaseNotesController.index);

router.post('/', 
  authMiddleware, 
  checkPermission('release:create'), 
  releaseNotesController.create
);

export default router;