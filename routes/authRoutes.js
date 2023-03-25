import express from "express"
const router = express.Router()

import  {register,login,updateUser,getCurrentUser,logout} from "../controllers/authController.js"
import authenticateUser from "../middleware/auth.js"
import testUser from "../middleware/testUser.js"
import rateLimiter from 'express-rate-limit';

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

/* // before limiter
router.route("/register").post(register)
router.route("/login").post(login) */


router.route('/register').post(apiLimiter, register);
router.route('/login').post(apiLimiter, login);
router.route('/logout').get(logout);

router.route("/updateUser").patch(authenticateUser,testUser,updateUser)
router.route("/getCurrentUser").get(authenticateUser,getCurrentUser)


export default router






