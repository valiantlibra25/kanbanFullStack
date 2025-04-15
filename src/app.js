import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'


const app = express()


//router imports
import healthRouter from '../src/routes/healthcheck.routes.js'
import userRouter from '../src/routes/auth.routes.js'
import projectRouter from './routes/project.routes.js'
import taskRouter from './routes/task.routes.js'
import noteRouter from './routes/note.routes.js'



app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true,
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization','Accept'],
    exposedHeaders:['Set-Cookie','*']
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use("/api/v1/healthCheck", healthRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/project", projectRouter)
app.use("/api/v1/task", taskRouter)
app.use("/api/v1/note",noteRouter)

export default app