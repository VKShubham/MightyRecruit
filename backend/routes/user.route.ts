import express from 'express'
import { changePassword, checkUsername, createCandidate, forgetPassword, getUserDetails, logout, signin, signup } from '../controller/user.controller';
import rateLimit from 'express-rate-limit';
const router = express.Router();

router.post('/login', signin);
router.post('/signup', signup);
router.get('/user', getUserDetails);
router.get('/checkusername', checkUsername);
router.patch('/password', rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    max: 2, // limit each IP to 2 requests per windowMs
    message: 'Too many password change attempts. Please try again tomorrow.'
}), changePassword);
router.post('/logout', logout);
router.post('/candidate', createCandidate);
router.patch('/forget-password', rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    max: 5, // limit each IP to 3 requests per windowMs
    message: 'Too Many Requests'
}) ,forgetPassword);

export default router;