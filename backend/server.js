const app = require("./app");

const dotenv = require("dotenv")
const connectDatabase = require("./config/database")

//Unhandled Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

//Config 

dotenv.config({path:"backend/config/config.env"});

//Connecting to a database (Make sure to call this after config as it will have to find the env file and it will be problematic if we call the connect database earlier then config)
connectDatabase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
});


// Unhandled Promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
})