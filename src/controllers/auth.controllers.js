import express from 'express'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { User } from '../models/user.models.js'

const registerUser = asyncHandler(async(req, res)=>{
   const { username, email, password, avatar,fullname} = req.body

   const existingUser = await User.findOne({email})
   if(existingUser){
      throw new ApiError(400,"user already exists")
   }

   const user = await User.create({
      username,
      email,
      password,
      avatar,
      fullname
   })

   if(!user){
      throw new ApiError(401,"user registration failed")
   }


   const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken()

   console.log(hashedToken)
   if(!hashedToken){
      throw new ApiError(401,"token verifiation failed")
   }

   user.emailVerificationToken = hashedToken
   user.emailVerificationExpiry = Date(tokenExpiry)
   
   console.log(hashedToken, tokenExpiry)
   
   await user.save()

   const response = new ApiResponse(201, "User registered successfully", {
      email
    });
  
    res.status(response.statusCode).json(response);
})


export {registerUser}