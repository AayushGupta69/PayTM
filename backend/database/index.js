require('dotenv').config();
const mongoose = require('mongoose');

async function connectToMongoDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected...");
    }
    catch (e) {
        console.error("MongoDB connection error:", e);
    }
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})

const User = mongoose.model("User", userSchema);

module.exports = {
    connectToMongoDB,
    User
};