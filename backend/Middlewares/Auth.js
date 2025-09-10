const jwt = require('jsonwebtoken');
const ensureAuthenticated = (req,res,next) => {
    const auth = req.headers['authorization'];
    if(!auth){
        return res.status(401).json({message: "Unauthorized, jwt token is required", success: false});
    }
    try{
        const decoded = jwt.verify(auth,process.env.JWT_SECRET); // Verify the JWT token
        req.user = decoded; // Attach the decoded user info to the request object
        next(); 
    }catch(err){
        return res.status(401).json({message: "Unauthorized, invalid jwt token", success: false});

    }
    
}

module.exports = ensureAuthenticated;