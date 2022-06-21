const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync'); 
const {campgroundSchema} = require('../schema.js');
const ExpressError = require('../Utils/ExpressError');
const Campground = require('../models/campground'); 

const validateCampground = (req,res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map( el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {next(); }  
} 

router.get('/', catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', {campgrounds}); 
}));

router.get('/new', (req,res) => {
    res.render('campgrounds/new'); 
})

router.post('/', validateCampground, catchAsync (async(req,res, next) => {
    //if (!req.body.campground) throw new ExpressError('Ivalid Campground Data', 400); 
    //we use req.body.campground because our name value in our new.ejs 
    // uses campground[title] & campground[location]
    //whenever using this bracket style for names, we use req.body.object
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('sucess', 'succesfully made a new spaceground'); 
    res.redirect(`/campgrounds/${campground._id}`)
}  ))

router.get('/:id', catchAsync (async (req,res) => {
    //to get the id from the link, we use req.params.id
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if( ! campground ) {
        req.flash('error', "Couldn't Find that Campground :( "); 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground}); 
}))

router.get('/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground}); 
}));

router.put('/:id', validateCampground, catchAsync(async (req,res) => {
    const { id } = req.params; 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    req.flash('sucess', 'Succesfully Edited a spaceground'); 
    res.redirect(`/campgrounds/${campground._id}`);
})); 

router.delete('/:id', catchAsync(async (req,res)=> {
    const {id} = req.params; 
    await Campground.findByIdAndDelete(id); 
    req.flash('sucess', 'Succesfully Deleted a spaceground'); 
    res.redirect('/campgrounds'); 
})); 

module.exports = router; 