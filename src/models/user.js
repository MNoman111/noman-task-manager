const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if( value.length < 0 ){
                throw new Error("Age cannot be less than 0");
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if( !validator.isEmail(value) ){
                throw new Error("Email is invalid.")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if( value.length < 7 ){
                throw new Error("password length should be greater than 6")
            }else if( value.toLowerCase().includes("password") ){
                throw new Error("password cannot include password")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
} )

userSchema.pre( "save", async function (next) {
    const user = this;
    if( user.isModified("password") ){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
} )

userSchema.pre( "remove", async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
} )

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject
}

userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_TOKEN)
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token
}

userSchema.statics.findByUserCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error("Unable to login.")
    }
    const isMatch = await bcrypt.compare( password, user.password )
    if(!isMatch){
        throw new Error("Unable to login.")
    }
    return user;
}

const User = new mongoose.model( "User", userSchema)

module.exports = User;