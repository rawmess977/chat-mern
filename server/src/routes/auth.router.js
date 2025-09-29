import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import {signupSchema, loginSchema} from '../validation/auth.Schema.js';

const router = express.Router();
router.post('/signup',validate(signupSchema), signup)
router.post('/login',validate(loginSchema), login)
router.post('/logout', logout)
// router.get('/login', );
// router.get('/logout', (req, res) => {
//   res.send('Logout Page');
// });

export default router;