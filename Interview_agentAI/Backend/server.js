require("dotenv").config()

const app = require('./src/app')
const connectToDB = require('./src/config/database') 

connectToDB()

app.listen(5000, () => {
    console.log("Server running on port 5000")
})

