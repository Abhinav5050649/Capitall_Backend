const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const router = express.Router();

//User Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)    return res.status(400).json({message: "Incomplete Details!"});

        const userCheck = await User.findOne({email});

        if (userCheck)  return res.status(403).json({message: "User already exists!"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            itemsPosted: [],
            itemsPurchased: []
        });

        const savedUser = await newUser.save();

        return res.status(201).json({ message: "User Created!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

//User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)    return res.status(400).json({message: "Incomplete Details!"});

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
        const response = res.cookie("token", token, {httpOnly: true});
        response.status(200).json({ message: "User logged in!"});

        return response;
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//User Logout
router.get("/logout", async (req, res) => {
    try {
        req.cookie.set("token", "");
        return res.status(200).json({message: "User logged out!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error!"});
    }
})

module.exports = router;