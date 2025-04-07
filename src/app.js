import express, { urlencoded } from 'express'

const app = express()


//router imports
import healthRouter from '../src/routes/healthcheck.routes.js'
import userRouter from '../src/routes/auth.routes.js'

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use("/api/v1/healthCheck", healthRouter)
app.use("/api/v1/user", userRouter)

export default app