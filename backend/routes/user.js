const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const {User} = require("../database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const router = express.Router();

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})
router.post("/signup", async (req, res) => {
    const {success} = signupBody.safeParse(req.body);
    if(!success){
        return res.status(400).json({message: "Incorrect inputs"});
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser) {
        return res.status(400).json({message: "Email already taken"});
    }

    const password = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
        username: req.body.username,
        password: password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const userId = user._id;

    const token = jwt.sign({userId}, JWT_SECRET);

    return res.status(200).json({
        message: "User created successfully",
        token
    })
})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        return res.status(400).json({message: "Invalid username or password"});
    }

    const user = await User.findOne({
        username: req.body.username
    })

    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
        return res.status(401).json({message: "Invalid username or password"});
    }

    const token = jwt.sign({userId: user._id}, JWT_SECRET);

    return res.status(200).json({token});
})

module.exports = router;
