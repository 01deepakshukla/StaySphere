const express = require("express");
const app = express();

const userRouter = require("./routes/user");

app.use("/users", userRouter);

app.listen(8080, () => {
    console.log("Server started");
});