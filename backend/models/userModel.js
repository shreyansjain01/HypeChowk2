const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have atleast 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,   //Every user should have an original email and not the smae one 
        validate: [validator.isEmail, "Please Enter a valid email"], //Checks whether the email is entered correctly or not 
    },
    password: {
        type :String,
        required: [true, "Please enter password"],
        minLength: [6, "Password should have atleast 6 characters"],
        select: false, //This method will not show password when a function is called
    },
    avtar: {
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});

userSchema.pre("save", async function(next){  //THis function helps to hash the passwrod so even we in the backend cant see it
    if(!this.isModified("password")) {  //The if condition is made so that while upadting the password it should not be hashed 2 times
        next();
    }

    this.password = await bcrypt.hash(this.password,10)
});

//JWT TOKEN  (THis is for when we register in the website we are automatically locked in)
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{ //here we are generating a key that is very very sensitive. If someone gets a hold of it he can make lots of admin accounts
        expiresIn:process.env.JWT_EXPIRE,   
    });
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function() {

    //Generating Token 
    const resetToken  = crypto.randomBytes(20).toString("hex");

    //Hashing and adding resetPasswordToken to userScehma
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now + 15 * 60 * 1000;
    
    return resetToken; 
} 


module.exports = mongoose.model("User", userSchema);