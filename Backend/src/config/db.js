const mongoose = require("mongoose")

async function connectDb() {
    
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("databse connected successfully")
    }
    catch(err){
        console.log("Database Connection error: ",err)
    }
}

module.exports = connectDb