const mongoose = require(`mongoose`)
require('dotenv').config();

const mongooseURL = process.env.MONGO_URL

const connectToMongo = () => {
    mongoose
        .connect(mongooseURL)
        .then(() => {
            console.log(
                "Connected to DB!"
            );
        })
        .catch((err) => {
            console.error("The DB is not connecting or The DB host unresponsive!", err);
        });
}

module.exports = connectToMongo