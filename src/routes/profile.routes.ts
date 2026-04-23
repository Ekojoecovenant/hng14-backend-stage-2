import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';

const router = Router();

router.get('/', profileController.getProfiles);
router.get('/search', profileController.searchProfiles);

export default router;