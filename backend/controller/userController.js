const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors  = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//Register a User

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avtar:{
            public_id:"this is a sample id",
            url:"profilepicUrl"
        }        
    });

    sendToken(user,201,res);
});

//Login User
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{

    const{email,password} = req.body;

    //Checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("Please enter Email and Password",400))
    }

    const user = await User.findOne({ email }).select("+password") //because of select:false in pasword we put + to dinf it when searching for a user

    if(!user) {
        return next(new ErrorHandler("Invalid Email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or password",401));
    }

    sendToken(user, 200, res);
});

//LogOut User
exports.logout = catchAsyncErrors(async(req,res,next)=>{
    
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:"true",
    });
    
    res.status(200).json({
        success:true,
        message:"Logged Out"
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user) {
        return next(new ErrorHandler("User not found",404))
    }

    //Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/passwrpd/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email 
    then, please ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject:`HypeChowk Password Recovery`,
            message,

        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

});

//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{

    //Creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await user.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now() },
    })
    if(!user) {
        return next(new ErrorHandler("reset password Token is invalid or has been expired",404))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("reset password Token is invalid or has been expired",404));        
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});

//Get user Details

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id); //In (auth.js) if the user is logged in then whole req.user func will be saved
    
    res.status(200).json({
        success:true,
        user,
    })
});

//Update User Password

exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password"); //In (auth.js) if the user is logged in then whole req.user func will be saved
    
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect ", 400));
    };

    if(req.body.newPassword !== req.body.confirmPassword ) {
        return next(new ErrorHandler("password does not match ", 400));
    };

    user.password = req.body.newPassword;
    
    await user.save();

    sendToken(user ,200 ,res)
    
});

//Update User Profile (error Solved using AI)

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            error: 'Both name and email are required for update.',
        });
    }

    const newUserData = {
        name,
        email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});


//In productRoutes change .get(getProductDetails) with router.router("/product/:id").get(getProductDetails);
//Just add admin in links given in productRoutes and change accordingly in postman api (Create, Update & Delete)

//Get All Users (Admin)
exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.find();

    res.status(200).json({
        success:true,
        user,
    })
});


//Get single user (Admin can see the users detail)
exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User does not exist with Id :${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user,
    });
});

//Update User Role (Admin)

exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    //We will add cloudinary later 
    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,

    });
    
    res.status(200).json({
        success:true,
    })
});

//Delete User (DE)

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
    }

    await user.deleteOne(); // Use deleteOne() instead of remove()

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});








