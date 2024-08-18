const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
require('dotenv').config();

const checkUser = (req, res, next) => {
    try {
        const token = req.cookies["token"]; 
        if (token != null) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.id };
            next();
        } else {
            res.status(401);
            throw new Error("No user credentials found!");
        }
    } catch (error) {
        res.status(401);
        throw new Error("Faulty user credentials: ", error);
    }
};

module.exports = checkUser;