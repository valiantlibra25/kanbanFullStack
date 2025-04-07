import mongoose, { Schema } from 'mongoose'

const subTaskSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    task:{
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    isCompleted:{
        
    }
}, {
    timestamps: true
})

export const SubTask = mongoose.model("SubTask",subTaskSchema)