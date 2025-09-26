import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import signupSchema from '../validation/signup.schema.js';

const router = express.Router();
router.post('/signup',validate(signupSchema), signup)
// router.get('/login', );
// router.get('/logout', (req, res) => {
//   res.send('Logout Page');
// });

export default router;