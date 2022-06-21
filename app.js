const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override'); 
const mongoose = require('mongoose');  
const ejsMate = require('ejs-mate');  
const ExpressError = require('./Utils/ExpressError'); 

const session = require('express-session'); 
const flash = require('connect-flash'); 
//campgrounds routes 
const campgroundsRoutes = require('./routes/campgrounds'); 
const reviewRoutes = require('./routes/reviews'); 

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false 
}).
    then( () => {
        console.log("Mongo connection Open")
    }).
    catch( err=> {
        console.log("Mongo Connection Error")
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", () => {
    console.log("Database Connected."); 
}); 

app.engine('ejs', ejsMate); 
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//serve static assets from public folder 
app.use(express.static(path.join(__dirname, 'public'))); 

const sessionConfig = {
    secret: 'thisIsForDevelopment',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  
        expires: Date.now()+ (1000*60*60*24*7), 
        maxAge: (1000*60*60*24*7) 
    } 
}
app.use(session(sessionConfig)) ;
app.use(flash()); 

app.use((req,res, next) => {
    res.locals.sucess = req.flash('sucess');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundsRoutes); 
app.use('/campgrounds/:id/reviews', reviewRoutes); 

app.get('/', (req,res) => {
    res.render('home'); 
})


//the star means for every route we have
app.all('*',(req, res, next) => {
    next( new ExpressError('Page Not Found',404)); 
}); 
 
app.use((err,req,res,next)=> {
    const {statusCode = 500} = err; 
    if (!err.message) {err.message = 'Oh No! Something Broke :/' };  
    res.status(statusCode).render('error',{err});
})

app.listen(3000, () => {
    console.log("App Listening on 3000");
})

