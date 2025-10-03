import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validation/auth.Schema.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection)

router.post("/signup", validate(signupSchema), catchAsync(signup));
router.post("/login", validate(loginSchema), catchAsync(login));
router.post("/logout", catchAsync(logout));
router.put("/update-profile", protectRoute, catchAsync(updateProfile));
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;
