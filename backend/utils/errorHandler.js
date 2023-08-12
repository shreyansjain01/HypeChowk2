class ErrorHandler extends Error{
    constructor(message,statusCode){ //constructor is a special method that gets called when an instance of the class is created.
        super(message)
        this.statusCode = statusCode

        Error.captureStackTrace(this,this.constructor); /*Error.captureStackTrace(this, this.constructor) is called to capture 
                                                         a stack trace for the error object. This allows for better debugging 
                                                         by including the stack trace information in the error object.*/
    }

}

module.exports = ErrorHandler
