import { Router } from "express";
import {isLoggedIn} from '../middlewares/auth.middleware.js'
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";

const noteRouter = Router()


noteRouter.route("/create-note")
.post(isLoggedIn,createNote)

noteRouter.route("/delete-note/:noteId")
.post(isLoggedIn,deleteNote)

noteRouter.route("/get-note/:noteId")
.post(isLoggedIn,getNoteById)

noteRouter.route("/get-notes")
.post(isLoggedIn,getNotes)

noteRouter.route("/update-note/:projectId/:noteId")
.post(isLoggedIn,updateNote)


export default noteRouter