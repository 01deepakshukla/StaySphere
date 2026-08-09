const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("All posts");
});

router.get("/:id", (req, res) => {
    res.send("Post details");
});

module.exports = router;