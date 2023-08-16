const express = require("express");
const {registerUser, loginUser, logout, forgotPassword, resetPassword} = require("../controller/userController")
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

const { getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require("../controller/userController");


router.route("/register").post(registerUser); //This will help to register the user in postman by using link with /api/v1/registration
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(logout);    

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

router.route("/admin/user/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser )
.put(isAuthenticatedUser, authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser, authorizeRoles("admin"),deleteUser);


module.exports = router;