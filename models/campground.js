const mongoose = require('mongoose');
const Review = require('./review'); 
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema ( {
    title: String,
    image: String,
    price: Number,
    description: String, 
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,   //connect to reviews id
        ref: 'Review'   //connect specifally to objects in the review model
    }]
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) { //if there is something that gets deleted
        await Review.deleteMany({ //them we remove the reviews with these ids 
            _id: { //the id array 
                $in: doc.reviews //the $in operator gets the ids from the review attribute of the doc object
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema); 
//mongoose.model() actually complies the schema 
