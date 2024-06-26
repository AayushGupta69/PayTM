const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const {User, Account} = require("../database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const {authMiddleware} = require("../middlewares/middleware");
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

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

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

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({message: "Error while updating information"})
    }

    await User.updateOne({_id: req.userId}, req.body);

    return res.status(200).json({message: "Updated successfully"});
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    return res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
})

module.exports = router;
