import mongoose, { Schema } from 'mongoose'
import {AvailableRoles, UserRoleEnum} from '../utils/constants.js'

const projectMemberSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project:{
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    role:{
        type: String,
        enum: AvailableRoles,
        default: UserRoleEnum.MEMBER
    }
},{
    timestamps: true
})

export const ProjectMember = mongoose.model("ProjectMember",projectMemberSchema)