import { Router } from 'express';
import { ReleaseNotesController } from '../controllers/ReleaseNotes.controller';

const router = Router();
const releaseNotesController = new ReleaseNotesController();

router.get('/', releaseNotesController.index);
router.post('/', releaseNotesController.create);

export default router;