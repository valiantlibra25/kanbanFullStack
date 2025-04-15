import { asyncHandler } from "../utils/async-handler.js";
import { TaskStatusEnum } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import mongoose from "mongoose";
const createTask = asyncHandler(async (req, res) => {
    const { title, description, projectId, assignedTo, status = TaskStatusEnum.TODO } = req.body

    const userId = req.user._id

    const titleTrimmed = title?.trim()

    if (!titleTrimmed || !projectId || !assignedTo) {
        throw new ApiError(400, "title, project and assignedTo are required")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(400, "project not found")
    }

    const isMember = await ProjectMember.findOne(
        {
            project: projectId,
            user: assignedTo
        }
    )

    if(!isMember){
        throw new ApiError(400,"Assigned user is not member of the project")
    }

    const task = await Task.create({
        title,
        description:description.trim(),
        project:projectId,
        assignedTo,
        assignedBy:userId,
        status
    })

    return res.status(201).json(new ApiResponse(200,"task  has been created successfully"))

})

const createSubTask = asyncHandler(async(req,res)=>{
    const {subTitle,taskId,isCompleted} = req.body
    const userId = req.user._id

    const titleTrimmed = subTitle?.trim()
    if(!titleTrimmed || !taskId){
        throw new ApiError(400,"sub Task Tittle and taskId is required")
    }

    const task = await Task.findById(taskId)

    if(!task){
        throw new ApiError(400,"Main task does not exists")
    }

    const existingSubtask = await SubTask.findOne({
        title:titleTrimmed,
        task: taskId
    })

    if(existingSubtask){
        throw new ApiError(400,"subtask already exists")
    }

    const subTask = await SubTask.create({
        title:subTitle,
        task:taskId,
        isCompleted,
        createdBy: userId
    })

    return res.status(200).json(new ApiResponse(201,subTask,"Subtask added"))
})

const deleteSubTask = asyncHandler(async(req,res)=>{
    const {subTaskId} = req.params

    const deleteSubTask = await SubTask.findByIdAndDelete(subTaskId)

    if(!deleteSubTask){
        throw new ApiError(400,"Sub task not fond")
    }

    return res.status(200).json(new ApiResponse(201,"Subtask deleted"))


})

const deleteTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params

    const deleteTask = await Task.findByIdAndDelete(taskId)

    if(!deleteTask){
        throw new ApiError(400,"Task does not exists")
    }

    const subtaskDelete = await SubTask.deleteMany({
        task: taskId
    })

    return res.status(200).json(new ApiResponse(201,"Task deleted successfully"))
})

const getTaskById = asyncHandler(async(req,res)=>{
    const {taskId} = req.params

    // const task = await Task.findById(taskId)

    const task = await Task.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId.createFromHexString(taskId)
          },
        },
        {
          $lookup: {
            from: "subtasks",
            localField: "_id",
            foreignField: "task",
            as: "subtasks",
          },
        },
      ]);

    if(!task){
        throw new ApiError(400,"task not found")
    }

    return res.status(200).json(new ApiResponse(201,task,"task found"))
})

const getTask = asyncHandler(async(req,res)=>{
    const task = await Task.aggregate([
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(201,task,"Fetched all tasks"))
})

const updateTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params

    const userId = req.user?._id

    const {
        title,
        description,
        projectId,
        assignedTo,
        status = TaskStatusEnum.TODO
    } = req.body

    if(!taskId){
        throw new ApiError(400,"taskID is required")
    }

    if(status && !Object.values(TaskStatusEnum).includes(status)){
        throw new ApiError(400,'Invalid task status')
    }

    const updateData = {
        ...(title && {title: title.trim()}),
        ...(description && {description: description.trim()}),
        ...(assignedTo && {assignedTo}),
        ...(userId && {assignedBy: userId}),
        ...(status && {status})
    }

    const updateTask = await Task.findByIdAndUpdate(
        {_id: taskId, ...(projectId && {project: projectId})},
        updateData,
        {new: true}
    )

    if(!updateTask){
        throw new ApiError(404,"Task not found for given taskID")
    }

    return res.status(200).json(new ApiResponse(201,"Task updated successfully"))
})

const updateSubTask = asyncHandler(async(req,res)=>{
    const {taskId,subtaskId} = req.params
    const {title,isCompleted,} = req.body

    if(!taskId || !subtaskId){
        throw new ApiError(400,"taskId and subtaskId is needed")
    }

    if(typeof isCompleted !== "boolean"){
        throw new ApiError(400,"enter only true or false in isCompleted")
    }

    const updatedSubTask = await SubTask.findOneAndUpdate(
        {_id:subtaskId,task:taskId},
        {
            ...(isCompleted && {isCompleted}),
            ...(title && {title})
        },
        {
            new:true
        }
    )

    if(!updatedSubTask){
        throw new ApiError(400,"Subtask not found for give taskID")
    }

    return res.status(200).json(new ApiResponse(201,"Subtask updated successfully"))


})

export {createTask, createSubTask, deleteSubTask, deleteTask, getTaskById,getTask, updateTask,updateSubTask}