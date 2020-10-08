import express from "express";
const router = express.Router();
import { signin, signup, verify } from "../controllers/auth.js";

router.post("/signin", signin);
router.post("/signup", signup);

//Signup Email Verify
router.get("/verify/:token", verify);

export { router };
