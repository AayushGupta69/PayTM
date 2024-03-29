require('dotenv').config();
const express = require("express");
const {connectToMongoDB} = require("./database");

const app = express();

app.listen(process.env.PORT, () => {
    console.log("Started listening on port!");
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({message: "Internal Server Error"});
})