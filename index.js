const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

//middleware
app.use(express.json());

//routes
const hullRoutes = require("./algo/grahamsScan");

app.use("/api",hullRoutes);



const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})