const express = require('express');
const router = express.Router( {mergeParams: true} ); 

const catchAsync = require('../Utils/catchAsync'); 
const {reviewSchema} = require('../schema.js');
const ExpressError = require('../Utils/ExpressError');
const Campground = require('../models/campground'); 
const Review = require('../models/review');

const validateReview = (req,res, next) => {
    const {error} = reviewSchema.validate(req.body); 
    if(error){
        const msg = error.details.map( el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {next();}  
} 

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('sucess', 'Succesfully Created a new review'); 
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    //find the campground, use the pull operator to look at its reviews, and then take out that reference id
    await Campground.findByIdAndUpdate(req.params.id, {$pull:{reviews: req.params.reviewId}}); 
    await Review.findByIdAndDelete(req.params.reviewId); 
    req.flash('sucess', 'Succesfully Deleted a review'); 
    res.redirect(`/campgrounds/${req.params.id}`); 
})) 

module.exports = router; 