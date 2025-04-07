import express from "express"
import { healthCheckRouter } from "../controllers/healthcheck.controllers.js"


const healthRouter = express.Router()

healthRouter.route("/").get(healthCheckRouter)

export default healthRouter