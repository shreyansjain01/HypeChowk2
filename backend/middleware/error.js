const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{

    err.statusCode = res.statusCode === 200 ? res.statusCode : 500; //I made changes here in which i changed the code from 
    err.message = err.message || "Internal Server Error";

    //Wrong Mongodb Id Error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400)
    }

    //Mongoose duplicate key error
    if(err.code === 11000 ) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message, //If we would have put err.stack then it would have shown the location pf the error as well
    })

    //Wrong JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json web Token is invalid, Try again `;
        err = new ErrorHandler(message,400)
    }

     //JWT Expire Error
     if(err.name === "TokenExpiredError"){
        const message = `Json web Token is expired, Try again `;
        err = new ErrorHandler(message,400)
    }
}