import {ApiResponse} from '../utils/api-response.js'

export const healthCheckRouter = (req, res) =>{
    res.status(200).json(
        new ApiResponse(200,{message: "Server is running"}))
}


