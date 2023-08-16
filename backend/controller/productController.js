//Here we will make the product apis using 4 operations of CRUD using GET< POST, PUT, DELETE

const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors  = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");



//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next)=>{

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });

});

//Get All Products

exports.getAllProducts = catchAsyncErrors(async (req, res)=>{

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
     
    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    const products = await apiFeature.query; //We are calling product.find() method twice so we will be removing this and switching it with apifeatures
    
    res.status(200).json({
        success:true,
        products,
        productCount,
    });
});

//Get Single Product(Product Details)

exports.getproductDetails = catchAsyncErrors(async (req, res, next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product
    });

});


//Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    });
});

//Delete Product 

exports.deleteProduct = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    });
    
});

//Create new Review or Update the review (M)

exports.createProductReview = catchAsyncErrors(async (req, res, next)=>{
    
    const {rating,comment,productId} = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    
    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());


    if(isReviewed){
        product.reviews.forEach((rev) => {

            if (rev.user.toString() === req.user._id.toString()) {
                (rev.rating=rating), 
                (rev.comment=comment);
            }

        });

    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach( (rev) => {
        avg+=rev.rating;
    }) ;
    product.ratings = avg / product.reviews.length;

    await product.save( {validateBeforeSave : false} );

    res.status(200).json({
        success:true,

    });

});

//Get all reviews of a product 
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if(!product) {
        return next(new ErrorHandler("Product not found",404))
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });

});

//Delete Review

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));ghbv
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });
