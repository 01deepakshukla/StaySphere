
const Listing = require("../models/listing");
const axios = require("axios");

// ========================================
// GEOCODING FUNCTION
// ========================================

async function getCoordinates(location) {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: location,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "WanderLustApp/1.0"
                }
            }
        );

        if (response.data && response.data.length > 0) {
            const lat = Number(response.data[0].lat);
            const lng = Number(response.data[0].lon);

            return [lng, lat];
        }

        return null;

    } catch (err) {
        console.error("Geocoding Error:", err.message);
        return null;
    }
}


// ========================================
// INDEX - ALL LISTINGS + SEARCH
// ========================================

module.exports.index = async (req, res) => {
    const { search } = req.query;

    let allListings;

    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search.trim(), "i");

        allListings = await Listing.find({
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
        allListings
    });
};


// ========================================
// NEW FORM
// ========================================

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// ========================================
// SHOW LISTING
// ========================================

module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
        listing,
        mapToken: process.env.MAP_TOKEN
    });
};


// ========================================
// CREATE LISTING
// ========================================

module.exports.createListing = async (req, res) => {
    try {
        const location = req.body.listing.location;

        const newListing = new Listing(req.body.listing);


        // ========================================
        // ASSIGN OWNER
        // ========================================

        newListing.owner = req.user._id;


        // ========================================
        // HANDLE IMAGE
        // ========================================

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }


        // ========================================
        // GEOCODING
        // ========================================

        const coordinates = await getCoordinates(location);

        if (coordinates) {
            newListing.geometry = {
                type: "Point",
                coordinates: coordinates
            };
        } else {
            console.log(
                "Location could not be found:",
                location
            );
        }


        // ========================================
        // SAVE LISTING
        // ========================================

        await newListing.save();


        // ========================================
        // FLASH MESSAGE
        // ========================================

        req.flash(
            "success",
            "New listing created successfully!"
        );


        // ========================================
        // REDIRECT
        // ========================================

        res.redirect("/listings");

    } catch (err) {
        console.error("Create Listing Error:", err);

        req.flash(
            "error",
            "Something went wrong while creating listing!"
        );

        res.redirect("/listings/new");
    }
};


// ========================================
// RENDER EDIT FORM
// ========================================

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", {
        listing
    });
};


// ========================================
// UPDATE LISTING
// ========================================

module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect("/listings");
        }


        // ========================================
        // UPDATE BASIC DETAILS
        // ========================================

        listing.set(req.body.listing);


        // ========================================
        // UPDATE LOCATION / GEOMETRY
        // ========================================

        if (
            req.body.listing.location &&
            req.body.listing.location.trim() !== ""
        ) {
            const coordinates = await getCoordinates(
                req.body.listing.location
            );

            if (coordinates) {
                listing.geometry = {
                    type: "Point",
                    coordinates: coordinates
                };
            } else {
                console.log(
                    "Updated location could not be found:",
                    req.body.listing.location
                );
            }
        }


        // ========================================
        // UPDATE IMAGE
        // ========================================

        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }


        // ========================================
        // SAVE UPDATED LISTING
        // ========================================

        await listing.save();


        // ========================================
        // FLASH MESSAGE
        // ========================================

        req.flash(
            "success",
            "Listing updated successfully!"
        );


        // ========================================
        // REDIRECT
        // ========================================

        res.redirect(`/listings/${id}`);

    } catch (err) {
        console.error("Update Listing Error:", err);

        req.flash(
            "error",
            "Something went wrong while updating listing!"
        );

        res.redirect("/listings");
    }
};


// ========================================
// DELETE LISTING
// ========================================

module.exports.destroyListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing =
            await Listing.findByIdAndDelete(id);

        if (!listing) {
            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect("/listings");
        }


        // ========================================
        // FLASH MESSAGE
        // ========================================

        req.flash(
            "success",
            "Listing deleted successfully!"
        );


        // ========================================
        // REDIRECT
        // ========================================

        res.redirect("/listings");

    } catch (err) {
        console.error("Delete Listing Error:", err);

        req.flash(
            "error",
            "Something went wrong while deleting listing!"
        );

        res.redirect("/listings");
    }
};