const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const cors = require('cors')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://interview-ai-agent-project.vercel.app",
    credentials:true
}))

const authRouter = require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')
const chatRouter = require("./routes/chat.routes")

app.use('/api/auth', authRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/auth', authRouter)
app.use("/api/chat", chatRouter)

module.exports = app