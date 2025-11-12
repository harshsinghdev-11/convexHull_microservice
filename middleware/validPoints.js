function validate(req,res,next){
    let {points} = req.body;
        if(!points || Array.isArray(points)===false || points.length<3){
            return res.status(400).json({
                error:"Invalid input"
            })
        }
         for (const p of points)
            {
            if(!Array.isArray(p) || p.length!=2){
                return res.status(400).json({
                error:"Invalid input"
            })
            }
            const [x,y] = p;
            if(!Number.isFinite(x) || !Number.isFinite(y))
                {
                 return res.status(400).json({
                    message:"Invalid input"
                 })
            }
        }

    next()
}

module.exports = validate;