import express from 'express'
import { validate } from '../middlewares/validator.middleware.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { createProjectValidator } from '../validators/index.js'
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from '../controllers/project.controllers.js'


const projectRouter = express.Router()

projectRouter.route("/createproject")
.post(isLoggedIn,createProjectValidator(),validate,createProject)

projectRouter.route("/getprojects")
.get(isLoggedIn,getProjects)

projectRouter.route("/getprojectbyid/:id")
.get(isLoggedIn,getProjectById)

projectRouter.route("/updateproject/:id")
.post(isLoggedIn,createProjectValidator(),validate,updateProject)

projectRouter.route("/deleteproject/:id")
.post(isLoggedIn,deleteProject)

export default projectRouter