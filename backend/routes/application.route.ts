import express from 'express'
import { changeApplicationStatus, createApplication, getAdvanceFilterInfo, getAllPendingApplications, getApplicationDetails, getApprovedApplications, getHiringTrends, getNextStageDetails, getUserApplications } from '../controller/application.controller';
import rateLimit from 'express-rate-limit';
const router = express.Router();
router.post('/create', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: "Too many requests from this IP, please try again later."
}), createApplication);
router.get('/user', getUserApplications);
router.get('/pending', getAllPendingApplications);
router.patch('/status', changeApplicationStatus);
router.get('/approved', getApprovedApplications);
router.get('/hiringTrends', getHiringTrends);
router.get('/filter', getAdvanceFilterInfo);
router.get('/:id', getApplicationDetails);
router.get('/nextStage/:id', getNextStageDetails);

export default router;