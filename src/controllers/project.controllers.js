import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { json } from "express";

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

export { createProject, getProjects, updateProject, deleteProject, getProjectById }