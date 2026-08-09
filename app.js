require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// ================= DATABASE =================

const MONGO_URL = process.env.MONGODB_URL;

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// ================= APP CONFIG =================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.use(
    methodOverride("_method")
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ================= SESSION =================

const sessionOptions = {
    secret: "mysupersecretcode",

    resave: false,

    saveUninitialized: true,

    cookie: {
        expires:
            Date.now() +
            7 * 24 * 60 * 60 * 1000,

        maxAge:
            7 * 24 * 60 * 60 * 1000,

        httpOnly: true
    }
};

app.use(
    session(sessionOptions)
);


// ================= FLASH =================

app.use(flash());


// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);


// ================= GLOBAL VARIABLES =================

// Flash messages

app.use((req, res, next) => {

    res.locals.success =
        req.flash("success");

    res.locals.error =
        req.flash("error");

    next();
});


// Current logged-in user

app.use((req, res, next) => {

    res.locals.currUser =
        req.user || null;

    next();
});


// ================= ROUTES =================

app.use(
    "/listings",
    listingRouter
);

app.use(
    "/listings/:id/reviews",
    reviewRouter
);

app.use(
    "/",
    userRouter
);


// ================= HOME ROUTE =================

app.get("/", (req, res) => {

    res.redirect("/listings");

});


// ================= 404 =================

app.use((req, res) => {

    res.status(404).send(
        "Page Not Found"
    );

});


// ================= SERVER =================

const PORT = 8080;

app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});
