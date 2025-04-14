import express from 'express'
import { validate } from '../middlewares/validator.middleware.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { createProjectValidator } from '../validators/index.js'
import { addMembersToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateProject } from '../controllers/project.controllers.js'


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

projectRouter.route("/add-member")
.post(isLoggedIn,addMembersToProject)

projectRouter.route("/delete-member")
.post(isLoggedIn,deleteMember)

projectRouter.route("/get-project-members/:projectId")
.post(isLoggedIn,getProjectMembers)

export default projectRouter