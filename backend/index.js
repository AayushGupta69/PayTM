require('dotenv').config();
const express = require("express");
const {connectToMongoDB} = require("./database");
const rootRouter = require("./routes/index");
const app = express();

app.use("/api/v1", rootRouter);

app.listen(process.env.PORT, () => {
    console.log("Started listening on port!");
});
