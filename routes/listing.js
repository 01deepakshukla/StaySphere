 const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const { isLoggedIn } = require("./middleware.js");

const { listingSchema } = require("../schema.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error);
    }

    next();
};

const listingController = require("../controllers/listings");
 
 
 
 router.get("/", wrapAsync(listingController.index));

router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);

router.get(
    "/:id",
    wrapAsync(listingController.showListing)
);

router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);

router.get(
    "/:id/edit",
    isLoggedIn,
    wrapAsync(listingController.renderEditForm)
);

router.put(
    "/:id",
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.updateListing)
);

router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(listingController.destroyListing)
);

module.exports = router;