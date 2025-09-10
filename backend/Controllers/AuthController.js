const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const signup = async (req, res) => {
    try{
        const {name,email,password} = req.body;
        const user = await UserModel.findOne({email});
        if(user){ // if user already exists
            return res.status(400).json({message: "User already exists!", success: false});
        }
        const userModel = new UserModel({name,email,password}); // create a new user model instance if user does not exist
        userModel.password = await bcrypt.hash(password, 10); // hash the password before saving the user
        await userModel.save(); // save the user to the database
        return res.status(201).json({message: "User created successfully!", success: true});


    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }

}


const login = async (req, res) => {
    try{
        const {email,password} = req.body;
        const user = await UserModel.findOne({email});
        const errorMsg = "Email or password is incorrect!";
        if(!user){ // if user already exists
            return res.status(403).json({message: errorMsg, success: false});
        }
        const isMatch = await bcrypt.compare(password,user.password); // compare the password with the hashed password in the database
        if(!isMatch){ // if password does not match
            return res.status(403).json({message: errorMsg, success: false});
        }

        const jwtToken = jwt.sign({ email: user.email, id: user._id}, process.env.JWT_SECRET, {expiresIn : "1h"});

        return res.status(200)
        .json({
            message:"Login successful!", 
            success: true, 
            token: jwtToken, 
            user: {id: user._id, name: user.name, email: user.email}
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }

}

module.exports ={signup,login};