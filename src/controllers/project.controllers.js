import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { json } from "express";
import { ProjectMember } from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    // console.log("cookie token",req.user)

    console.log(name, description)

    const project = new Project({
        name,
        description,
        createdBy: req.user._id
    })

    await project.save()

    const response = new ApiResponse(201, "Project created successfully");
    res.status(response.statusCode).json(response);
})

const getProjects = asyncHandler(async (req, res) => {

    const projects = await Project.find({
        createdBy: req.user._id
    })
        .sort({
            createdAt: -1
        })

    if (!projects) {
        throw new ApiError(400, "No projects found")
    }

     const response = new ApiResponse(200, projects)
     res.status(response.statusCode).json(response);

})

const getProjectById = asyncHandler(async (req,res)=>{
    const project = await Project.findOne({
        _id:req.params.id,
        createdBy: req.user._id
    })

    if(!project){
        throw new ApiError(400,"project not found")
    }

    const response = new ApiResponse(200,project)
    res.status(response.statusCode).json(response)
})

const updateProject = asyncHandler(async (req,res)=>{
    const {name, description} = req.body

    const project = await Project.findOne({
        _id: req.params.id,
        createdBy: req.user._id
    })

    if(!project){
        throw new ApiError(400,"Project not found")
    }

    if(name !==undefined) project.name = name
    if(description !== undefined) project.description = description

    await project.save()

    const response = new ApiResponse(200, "project updated")
     res.status(response.statusCode).json(response);

})

const deleteProject = asyncHandler(async (req,res)=>{

    const project = await Project.findByIdAndDelete({
        _id: req.params.id,
        createdBy: req.user._id
    })

    if(!project){
        throw new ApiError(400,"Project not found")
    }

    const response = new ApiResponse(200, "project deleted")
    res.status(response.statusCode).json(response);


})

const addMembersToProject  = asyncHandler (async(req,res)=>{
    const {projectId, userId, role=UserRolesEnum.MEMBER} = req.body

    const projectExsists = await Project.findById({_id:projectId})

    if(!projectExsists){
        throw new ApiError(400,"Project does not exists")
    }

    const exsistingMember = await ProjectMember.findOne({
        project: projectId,
        user: userId,
    })

    if(exsistingMember){
        throw new ApiError(400,"User already a member of this project")
    }

    const newMember = ProjectMember.create({
        project: projectId,
        user: userId,
        role
    })

    return res.status(201).json(new ApiResponse(201,newMember,"Member added to project"))
})

const deleteMember = asyncHandler(async(req,res)=>{
    const {projectId, userId} = req.body

    const removeMember = await ProjectMember.findOneAndDelete({
        project: projectId,
        user: userId
    })

    if(!removeMember){
        throw new ApiError(400,"no member found the the project")
    }

    return res.status(201).json(new ApiResponse(201,"Member removed successfully"))
})

const getProjectMembers = asyncHandler(async(req,res)=>{
    const {projectId} = req.params
    const userId = req.user._id

    // const isMember = await ProjectMember.findOne({
    //     user: userId
    // })

    // if(!isMember){
    //     throw new ApiError(400,"you are not apart of the project")
    // }

    const members = await ProjectMember.find({
        project:projectId
    }).populate(
        "user",
        "username email"
    )

    return res.status(200).json(new ApiResponse(200,members))
})


export { createProject, getProjects, updateProject, deleteProject, getProjectById, addMembersToProject, deleteMember, getProjectMembers }