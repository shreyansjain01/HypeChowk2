const userModel = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
 
  // Create the JWT token
  const { token } = (req.cookies);

  if(!token){
    return next(new ErrorHandler("Please login to access the resource",401))
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  
  req.user = await userModel.findById(decodedData.id);
  
  next();
});

exports.authorizeRoles = (...roles) =>{ //here roles is array as we have taken in triple dot
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next( new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403));
        }

        next();
    }
}