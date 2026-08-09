const express = require("express");
const router = express.Router();

const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");

const userController = require("../controllers/users");

// Signup Route
router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// Login Route
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;