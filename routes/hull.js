const express = require("express");
const router = express.Router();
const findConvexHull = require("../algo/grahamsScan");
const validate = require("../middleware/validPoints");


router.post("/getConvexHull",validate,async(req,res)=>{
    try {
        let {points} = req.body; 
   const convexHUllPoints =  await findConvexHull(points);
    res.status(200).json({
        message:"successfull",
        convexHUllPoints:convexHUllPoints
    })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error:"Invalid input",
        });
        
    }
})
module.exports = router;