import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'


const app = express()


//router imports
import healthRouter from '../src/routes/healthcheck.routes.js'
import userRouter from '../src/routes/auth.routes.js'
import projectRouter from './routes/project.routes.js'

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser())

app.use("/api/v1/healthCheck", healthRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/project", projectRouter)

export default app