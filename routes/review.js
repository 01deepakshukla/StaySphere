const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const reviewController = require("../controllers/reviews");

router.post(
    "/",
    wrapAsync(reviewController.createReview)
);

router.delete(
    "/:reviewId",
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;