import express from 'express'
import { createJob, editJob, getAllJobs, getJobById, getJobs, getJobStats, getRecentJobs } from '../controller/job.controller';
import rateLimit from 'express-rate-limit';
const router = express.Router();
router.post('/create', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Too many request, please try again later.'
}) ,createJob);
router.get('/all', getAllJobs)
router.get('/open', getJobs)
router.get('/stats', getJobStats)
router.get('/recentjobs', getRecentJobs)
router.get('/:id', getJobById)
router.patch('/update', editJob)

export default router;