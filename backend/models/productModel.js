const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter prodcut name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please Enter prodcut description"]
    },
    size:{
        type:String,
        required:[true,"Please Enter prodcut size"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter prodcut price"],
        maxLength:[8,"Price cannot exceed 8 characters"]
    },
    rating:{
        type:Number,
        default:0
    },
    images:[//Whenever we upload the images to a cloud lets say cloudinery it will generate one public id and image url
       {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
       }
    ],
    category:{
        type:String,
        required:[true,"Please enter product category"],
    },
    Stock:{
        type:Number,
        required:[true,"Please enter prodcut stock"],
        maxLength:[4,"Stock cannot exceed 4 characters"],
        default:1
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ],

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:"true",
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

});


module.exports = mongoose.model("Product",productSchema);