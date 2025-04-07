import express from 'express'
import {registerUser} from '../controllers/auth.controllers.js'
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from '../validators/index.js'

const userRouter = express.Router()


userRouter.route("/register").
post(userRegisterValidator(),validate, registerUser)

export default userRouter