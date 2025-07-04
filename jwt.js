const jwt = require('jsonwebtoken');

const isAuthenticated = (req,res,next)=>{
    try{
        const token =req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:"User not Authenticated",
                success:false
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if(!decoded){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        req.user = decoded;
        next();
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            message:"Invalid Token",
            success:false
        })
        
    }
}

const generateToken = (data)=>{
    return jwt.sign(data, process.env.JWT_SECRET, {expiresIn:50000} )
}
module.exports = {isAuthenticated,generateToken}