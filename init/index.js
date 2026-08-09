
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/Listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const path = require("path");

// ========================================
// LOAD ENVIRONMENT VARIABLES
// ========================================

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        path: path.join(__dirname, "../.env")
    });
}


// ========================================
// MAPBOX CONFIGURATION
// ========================================

const mapToken = process.env.MAP_TOKEN;

if (!mapToken) {
    console.log("MAP_TOKEN is missing in .env file");
    process.exit(1);
}

const geocodingClient = mbxGeocoding({
    accessToken: mapToken
});


// ========================================
// DATABASE
// ========================================

const MONGO_URL =
    "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("Database Error:", err);
    });


async function main() {
    await mongoose.connect(MONGO_URL);
}


// ========================================
// INITIALIZE DATABASE
// ========================================

const initDB = async () => {
    try {

        // Delete old listings
        await Listing.deleteMany({});

        console.log("Old listings deleted");


        // ========================================
        // GET COORDINATES FROM MAPBOX
        // ========================================

        const updatedData = await Promise.all(

            initData.data.map(async (obj) => {

                try {

                    const response =
                        await geocodingClient
                            .forwardGeocode({
                                query:
                                    `${obj.location}, ${obj.country}`,
                                limit: 1
                            })
                            .send();


                    // ========================================
                    // GEOMETRY
                    // ========================================

                    let geometry;

                    if (
                        response.body.features &&
                        response.body.features.length > 0
                    ) {

                        geometry =
                            response.body.features[0].geometry;

                    } else {

                        console.log(
                            "Location not found:",
                            obj.location,
                            obj.country
                        );

                        geometry = {
                            type: "Point",
                            coordinates: [0, 0]
                        };
                    }


                    // ========================================
                    // RETURN LISTING
                    // ========================================

                    return {
                        ...obj,

                        geometry: geometry
                    };

                } catch (err) {

                    console.log(
                        "Geocoding failed for:",
                        obj.location,
                        err.message
                    );

                    return {
                        ...obj,

                        geometry: {
                            type: "Point",
                            coordinates: [0, 0]
                        }
                    };
                }
            })
        );


        // ========================================
        // INSERT DATA
        // ========================================

        await Listing.insertMany(updatedData);

        console.log(
            "Data was initialized with correct Mapbox coordinates!"
        );

    } catch (err) {

        console.log(
            "Initialization Error:",
            err
        );

    } finally {

        await mongoose.connection.close();

        console.log("Database connection closed");

    }
};


// ========================================
// RUN INITIALIZATION
// ========================================

initDB();