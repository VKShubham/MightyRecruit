import express from 'express'
import { getCandidateDetails, getProfileDetails, isCandidate, register, RequestWithFiles } from '../controller/candidate.controller';
const router = express.Router();
const upload = require('../middlewares/multer');

router.get('/profile', getProfileDetails);
router.get('/exist', isCandidate);
router.post('/register',upload.fields([
    { name: 'resume_url', maxCount: 1 },
    { name: 'profile_picture_url', maxCount: 1 }
]), async (req, res) => {
        await register(req as RequestWithFiles, res);
});
router.get('/:id', getCandidateDetails);

export default router;