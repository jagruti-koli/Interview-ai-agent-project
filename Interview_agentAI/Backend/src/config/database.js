const mongoose = require('mongoose');

async function connectToDB() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to Database");

    } catch (err) {

        console.log("Connect to Database failed!", err.message);

    }
}

module.exports = connectToDB;