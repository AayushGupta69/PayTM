require('dotenv').config();
const express = require("express");
const {connectToMongoDB} = require("./database");
const rootRouter = require("./routes/index");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter);

app.listen(process.env.PORT, () => {
    console.log("Server listening on port " + process.env.PORT);
});
