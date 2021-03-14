const express = require('express');
const path = require('path');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const mongoose = require('mongoose');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error;"));
db.once("open", () => {
    console.log("Database connected");
});


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random18a = Math.floor(Math.random() * 18);
        const random18b = Math.floor(Math.random() * 18);
        const camp = new Campground({
            title: `${descriptors[random18a]} ${places[random18b]}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        });
        await camp.save();
    }
}

seedDB();