import express from 'express'
import { cancelInterview, createInterview, DeleteInterview, getAdvanceFilterInfo, getHRInterviews, getInterviewDetails, getInterviewRelatedDetails, getUpcComingInterview, setInterviewFeedback, updateAllDetails, updateInterviewerAndTimeDetails, updateInterviewerDetails, UpdateResult, updateTimeDetails } from '../controller/interview.controller';
const router = express.Router();

router.post('/create', createInterview)
router.get('/filter', getAdvanceFilterInfo);
router.get('/upcomingInterview', getUpcComingInterview)
router.get('/:id', getInterviewDetails)
router.delete('/:id', DeleteInterview)
router.get('/related/:id', getInterviewRelatedDetails)
router.patch('/feedback', setInterviewFeedback)
router.get('/interviews/hr', getHRInterviews)
router.patch('/all', updateAllDetails)
router.patch('/intreviewer', updateInterviewerDetails)
router.patch('/time', updateTimeDetails)
router.patch('/intreviewerandTime', updateInterviewerAndTimeDetails)
router.patch('/cancelInterview', cancelInterview)
router.patch('/result', UpdateResult)

export default router;