import express from 'express'
import applicationRoute from './application.route';
import jobRoute from './job.route';
import candidateRoute from './candidate.route';
import InterviewerRoute from './interviewer.route';
import InterviewRoute from './interview.route';
import userRoute from './user.route';
import badgeRoute from './badge.route';
const router = express.Router();

router.use('/user', userRoute);
router.use('/job', jobRoute);
router.use('/application', applicationRoute);
router.use('/candidate', candidateRoute)
router.use('/interviewer', InterviewerRoute)
router.use('/interview', InterviewRoute)
router.use('/badge', badgeRoute)

export default router;