const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type : String,
        required : true,
        
    },
    email : {
        type : String,
        required : true,
        unique : true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password : {
        type : String,
        required : true,
        minlength: [6, 'Password must be at least 6 characters long']
    }
})

const UserModel = mongoose.model('users',userSchema);
module.exports = UserModel;