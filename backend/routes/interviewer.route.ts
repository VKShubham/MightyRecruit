import express from 'express'
import { addInterviewer, getAllInterviewers, getAvailableInterviewer } from '../controller/Interviewer.controller';
const router = express.Router();

router.post('/create', addInterviewer);
router.get('/available/:time', getAvailableInterviewer);
router.get('/', getAllInterviewers)

export default router;