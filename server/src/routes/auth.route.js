import express from "express";
import { signup, login, logout, } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validation/auth.Schema.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), catchAsync(signup));
router.post("/login", validate(loginSchema), catchAsync(login));
router.post("/logout", catchAsync(logout));
// router.put("/update-profile", protectRoute, catchAsync(updateProfile));

export default router;
