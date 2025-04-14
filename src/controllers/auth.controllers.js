import express from 'express'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { User } from '../models/user.models.js'
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from '../utils/mail.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'


const registerUser = asyncHandler(async (req, res) => {
   const { username, email, password, fullname } = req.body

   const existingUser = await User.findOne({
      $or:[{username},{email}]
   })
   if (existingUser) {
      throw new ApiError(400, "user already exists")
   }

   const user = await User({
      username,
      email,
      password,
      fullname
   })

   if (!user) {
      throw new ApiError(401, "user registration failed")
   }


   const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken()

   console.log(hashedToken)
   if (!hashedToken) {
      throw new ApiError(401, "token verifiation failed")
   }
   console.log(tokenExpiry)

   user.emailVerificationToken = hashedToken
   user.emailVerificationExpiry = tokenExpiry

   // console.log(hashedToken, tokenExpiry)

   await user.save()

   const verifyUrl = `${process.env.BASE_URL}/api/v1/user/verifyuser/${unHashedToken}`;

   const mailgenContent = emailVerificationMailgenContent(username, verifyUrl)

   await sendEmail({
      email: user.email,
      subject: "verify your email",
      mailgenContent
   })

   const createUser = await User.findById(user._id).select(
      "-password -refreshtoken -avatar" 
   )

   if(!createUser){
      throw new ApiError(500,"Something went wrong while registering your account")
   }

   const response = new ApiResponse(201,createUser, "User registered successfully", {
      email
   });

   res.status(response.statusCode).json(response);
})

const verifyEmail = asyncHandler(async (req, res) => {
   //validation
   const { token } = req.params
   //console.log("hashed token: ",token)
   const getHasedToken = crypto.createHash("sha256").update(token).digest("hex")

   if (!token) {
      throw new ApiError(400, "token is not valid")
   }
   // const checkDate = new Date()
   const user = await User.findOne(
      {
         emailVerificationToken: getHasedToken,
         emailVerificationExpiry: { $gt: new Date() }
      })

   console.log(user)

   // console.log("Date: ", checkDate)

   // if(user.emailVerificationExpiry < checkDate){
   //    console.log("valid date")
   // }else{
   //    console.log("Invalid date")
   // }

   if (!user) {
      throw new ApiError(400, "Invalid Token")
   }

   user.isEmailVerified = true
   user.emailVerificationToken = undefined
   user.emailVerificationExpiry = undefined

   await user.save()

   const response = new ApiResponse(201, "User email verified successfully");

   res.status(response.statusCode).json(response);

});

const resendEmailVerification = asyncHandler (async(req,res)=>{
   const {email} = req.body

   const user = await User.findOne({email})
   console.log(user)
   if(!user){
      throw new ApiError(400,"email not registered, please sign up")
   }
   if(user.isEmailVerified){
      throw new ApiError(400,"email alredy verified")
   }

   const token = user.generateTemporaryToken()

   user.emailVerificationToken = token.hashedToken
   user.emailVerificationExpiry = token.tokenExpiry

   await user.save()

   await sendEmail({
      email,
      subject:"verify your email",
      mailgenContent: emailVerificationMailgenContent(
         user.username,
         `${process.env.BASE_URL}/api/v1/users/verify/${token.unHashedToken}`,
      )
   })

   return res
   .status(201)
   .json(
     new ApiResponse(201, "Verification email sent. Please check your inbox."),
   );
})

const loginUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;
   //validation
   const user = await User.findOne({ email })
   console.log(user)

   if (!user) {
      throw new ApiError(400, "Invalid Username")
   }

   const isMatch = await user.isPasswordCorrect(password, user.password)

   console.log("password match?: ", isMatch)

   if (!isMatch) {
      throw new ApiError(400, "Invalid Password")
   }
   const accessToken = await user.generateAccessToken()
   const refreshToken = await user.generateRefreshToken()

   user.refreshToken = refreshToken
   console.log(user.generateAccessToken())
   // console.log("token", token)

   if (!accessToken) {
      throw new ApiError(400, "token is not valid")
   }
   await user.save()


   const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
   }
   res.cookie("accessToken", accessToken, cookieOptions)
   res.cookie("refreshToken", refreshToken, cookieOptions)

   const response = new ApiResponse(201, "User logged in successfully");

   res.status(response.statusCode).json(response);
});

const getCurrentUser = asyncHandler(async (req, res) => {

   //validation
   console.log(req.user._id)
   const user = await User.findById(req.user._id).select('-password')

   console.log(user)
   if (!user) {
      throw new ApiError(400, "User not found")
   }

   const response = new ApiResponse(201, "User Found", {
      user
   });
   res.status(response.statusCode).json(response);

});

const refreshToken = asyncHandler(async (req,res)=>{
   const token = req.cookies.refreshToken

   if(!token){
      throw new ApiError(400,"No token found")
   }

   const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
   console.log(decoded)

   const user = await User.findById(req.user._id)

   if(!user){
      throw new ApiError(400,"user  not found")
   }
   console.log(user)

   const newRefreshToken = await user.generateRefreshToken()

   user.refreshToken = newRefreshToken

   await user.save()

   // console.log(newToken)
   console.log(user)
   const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
   }

   res.cookie("refreshToken", newRefreshToken, cookieOptions)

   const response = new ApiResponse(201, "token refreshed");

   res.status(response.statusCode).json(response);

})

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,{
         $unset:{
            refreshToken: 1
         }
      },
      {
         new: true
      }
   )
   res.clearCookie("accessToken")
   res.clearCookie("refreshToken")
   //validation

   const response = new ApiResponse(201, "User Logged out successfully");

   res.status(response.statusCode).json(response);

});


const forgotPasswordRequest = asyncHandler(async (req, res) => {
   //validation

   const { email } = req.body

   const user = await User.findOne({ email })

   if (!user) {
      throw new ApiError(400, "user not found")
   }

   console.log(user.email)


   const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken()

   user.forgotPasswordExpiry = tokenExpiry
   user.forgotPasswordToken = hashedToken
   await user.save()


   const passwordUrl = `${process.env.BASE_URL}/api/v1/user/resetpassword/${unHashedToken}`

   const mailgenContent = forgotPasswordMailgenContent(user.username, passwordUrl)

   await sendEmail({
      email: email,
      subject: "reset your password",
      mailgenContent
   })


   const response = new ApiResponse(201, "password reset link sent to email");

   res.status(response.statusCode).json(response);
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
   //validation
   const { token } = req.params
   console.log(token)
   const { newPassword } = req.body

   const getHasedToken = crypto.createHash("sha256").update(token).digest("hex")

   const user = await User.findOne({
      forgotPasswordToken: getHasedToken,
      forgotPasswordExpiry: { $gt: new Date() }
   })
   console.log(user)

   if (!user) {
      throw new ApiError(400, "reset link expired")
   }

   user.password = newPassword

   user.forgotPasswordToken = undefined
   user.forgotPasswordExpiry = undefined

   await user.save()

   const response = new ApiResponse(201, "password reset successfully");

   res.status(response.statusCode).json(response);


});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   console.log(req.user)
   //validation
   // get email from cookie
   const emailfromCookie = req.user.email

   const {oldPassword, newPassword} = req.body

   console.log(emailfromCookie)

   const user = await User.findOne({email: req.user.email})
   console.log(user)

   if(!user){
      throw new ApiError(400,"user not found")
   }

   const isMatch = await user.isPasswordCorrect(oldPassword ,user.password)

   console.log(isMatch)
   if(!isMatch){
      throw new ApiError(400,"Old password is not correct")
   }

   user.password = newPassword

   await user.save()

   const response = new ApiResponse(201, "password changed successfully");

   res.status(response.statusCode).json(response);
 });


export { registerUser, verifyEmail, loginUser, getCurrentUser, logoutUser, forgotPasswordRequest, resetForgottenPassword, changeCurrentPassword, refreshToken, resendEmailVerification  }