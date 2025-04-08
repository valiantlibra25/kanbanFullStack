import express from 'express'
import {changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, registerUser, resetForgottenPassword, verifyEmail} from '../controllers/auth.controllers.js'
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator,userLoginValidator,userForgotPasswordValidator,userResetForgottenPasswordValidator,userChangeCurrentPasswordValidator } from '../validators/index.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const userRouter = express.Router()


userRouter.route("/register")
.post(userRegisterValidator(),validate, registerUser)

userRouter.route("/verifyuser/:token").get(verifyEmail)

userRouter.route("/login")
.post(userLoginValidator(),validate, loginUser)

userRouter.route("/getme")
.post(isLoggedIn, getCurrentUser)

userRouter.route("/logout")
.post(isLoggedIn,logoutUser)

userRouter.route("/forgotpassword")
.post(userForgotPasswordValidator(), validate, forgotPasswordRequest)

userRouter.route("/resetpassword/:token")
.post(userResetForgottenPasswordValidator(),validate,resetForgottenPassword)


userRouter.route("/changepassword")
.post(isLoggedIn,userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)


export default userRouter