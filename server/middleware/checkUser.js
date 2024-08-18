const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
require('dotenv').config();

const checkUser = async(req, res, next) => {
    try {
        const userCookie = req.cookie.get("token");
        if (userCookie) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }else{
            res.status(401);
            throw new Error("No user credentials found!");
        }
    } catch (error) {
        res.status(401);
        throw new Error("Faulty user credentials: ", error);
    }
}

module.exports = {checkUser};