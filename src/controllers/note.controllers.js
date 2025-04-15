import {asyncHandler} from "../utils/async-handler.js"
import {ProjectNote} from "../models/note.models.js"
import {Project} from "../models/project.models.js"
import {ApiError} from "../utils/api-error.js"
import {ApiResponse} from "../utils/api-response.js"


const createNote = asyncHandler(async(req,res)=>{
    const {projectId,content} = req.body
    const userId = req.user._id
    if(!projectId){
        throw new ApiError(400,"project id is required")
    }

    const findProject = await Project.findById(projectId)

    if(!findProject){
        throw new ApiError(400,"project not found")
    }

    const trimmedContent = content.trim()

   const exsistingNote = await ProjectNote.findOne({
    project:projectId,
    content: trimmedContent
   })

   if(exsistingNote){
    throw new ApiError(400,"note is already present")
   }

    const note = await ProjectNote.create({
        project: projectId,
        content,
        createdBy: userId
    })

    if(!note){
        throw new ApiError(400,"note not created")
    }

    await note.save()

    return res.status(200).json(new ApiResponse(201,"note created successfully"))

})

const deleteNote = asyncHandler(async(req,res)=>{
    const {noteId} = req.params


    const deleteNote = await ProjectNote.findByIdAndDelete(noteId)

    if(!deleteNote){
        throw new ApiError(400,"note not found")
    }

    return res.status(200).json(new ApiResponse(201,"Note deleted successfully"))

})

const getNoteById = asyncHandler(async(req,res)=>{
    const {noteId} = req.params

    const note = await ProjectNote.findById(noteId)

    if(!note){
        throw new ApiError(400,"Note not found")
    }

    return res.status(200).json(new ApiResponse(201,note,"Note found"))

})

const getNotes = asyncHandler(async(req,res)=>{
    const {page = 1, limit = 10, projectId} = req.query

    const filter = projectId ? {project: projectId} : {}

    const notes = await ProjectNote.find(filter)
    .populate("project","name")
    .populate("createdBy","fullname email")
    .skip((page -1)* limit)
    .limit(parseInt(limit))
    .sort({createdAt: -1})

    const totalCount = await ProjectNote.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notes,
                pagination:{
                    total:totalCount,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalCount/limit)
                }
            },
            "Notes fetched sucessully"
        )
    )
})

const updateNote = asyncHandler(async(req,res)=>{
    const {projectId, noteId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError("content is required")
    }

    const updatedNote = await ProjectNote.findOneAndUpdate({
            _id:noteId,
            ...(projectId && {project:projectId})
        },
        {content},
        {new: true}
    )

    if(!updatedNote){
        throw new ApiError(400,"note not found")
    }

    return res.status(200).json(new ApiResponse(201,"Note updated succesfully"))

})

export {createNote,deleteNote, getNoteById, getNotes,updateNote}