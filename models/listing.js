const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: String,

    description: String,

    image: {
        filename: {
            type: String,
            default: "listingimage",
        },

        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        },
    },

    price: Number,

    location: String,

    country: String,
    // ✅ Correct GeoJSON Schema Format:
geometry: {
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
},
    

    
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref: "Review",
        },
    ],


});

const Listing =
    mongoose.models.Listing ||
    mongoose.model("Listing", listingSchema);

module.exports = Listing;