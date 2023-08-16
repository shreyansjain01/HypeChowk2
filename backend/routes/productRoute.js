const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getproductDetails } = require("../controller/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { getProductReviews, deleteReview, createProductReview } = require("../controller/productController");

const router = express.Router();


router.route("/products").get(getAllProducts);

router.route("/admin/products/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct); //This will help to create products in postman by using link with /api/v1/prodcuts/new

router.route("/admin/product/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct); //These three follow same url thats y we put them in the same code
router.route("/product/:id").get(getproductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview)




module.exports = router