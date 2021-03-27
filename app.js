const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const methodOverride =require('method-override');
const Joi =require('joi');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error;"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.engine('ejs', engine);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    //res.render('home');
    res.redirect(`/campgrounds`);
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// app.post('/campgrounds', async (req, res, next) => {
//     try{
//         const camp = new Campground(req.body.campground);
//         await camp.save();
//         res.redirect(`/campgrounds/${camp._id}`);
//     }catch(e){
//         next(e);
//     }
// })

app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400);

    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { campground } = req.body;
    const camp = await Campground.findByIdAndUpdate(id, {...campground});
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}))

// app.all('*', (req, res, next) =>{
//     res.send("404");
// })

app.all('*', (req, res, next) =>{
    next(new ExpressError("Page not found", 404));
})


app.use((err, req, res, next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oulala something is wrong"; 
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=>{
    console.log('serving on port 3000');
})