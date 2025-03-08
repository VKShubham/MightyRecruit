import express from 'express'
import { AttachBadge, CreateBadge, getAllBadges, GetApplicationBadges, UpdateBadge } from '../controller/badge.controller';
const router = express.Router();

router.post('/', CreateBadge);
router.patch('/', UpdateBadge);
router.post('/attach', AttachBadge);
router.get('/', getAllBadges);
router.get('/:application_id', GetApplicationBadges);
export default router;