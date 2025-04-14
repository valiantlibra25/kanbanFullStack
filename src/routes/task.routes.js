import {Router} from 'express'
import {isLoggedIn} from '../middlewares/auth.middleware.js'
import { createSubTask, createTask, deleteSubTask, deleteTask, getTask, getTaskById } from '../controllers/task.controllers.js'


const taskRouter = Router()

taskRouter.route("/createtask")
.post(isLoggedIn,createTask)

taskRouter.route("/create-sub-task")
.post(isLoggedIn,createSubTask)

taskRouter.route("/delete-sub-task/:subTaskId")
.post(isLoggedIn,deleteSubTask)

taskRouter.route("/delete-task/:taskId")
.post(isLoggedIn,deleteTask)

taskRouter.route("/gettaskbyid/:taskId")
.get(isLoggedIn,getTaskById)


taskRouter.route("/gettask")
.get(isLoggedIn,getTask)

export default taskRouter

