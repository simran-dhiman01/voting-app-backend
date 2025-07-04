const express = require('express')
const router = express.Router()
const { isAuthenticated, generateToken } = require('./../jwt')
const User = require('./../models/user')
const bcrypt = require('bcrypt');

//create profile
router.post('/signup', async (req, res) => {
    try {
        const { adharNumber, password, ...rest } = req.body;

        //check if there is already an admin present
        const isAdminExists = await User.findOne({ role: 'admin' })
        if (req.body.role === 'admin' && isAdminExists) {
            return res.status(400).json({
                message: "Admin already exists",
                success: false
            })
        }
         // Validate Aadhar Card Number must have exactly 8 digit
        if (!/^\d{8}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }
        
        //check if already a user exists 
        const userExists = await User.findOne({ adharNumber })
        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const newUser = new User({
            adharNumber,
            password: hashedPassword,
            ...rest
        });
        const response = await newUser.save()
        const payload = {
            id: response.id
        }
        const token = generateToken(payload)
        res.status(200).json({ response: response, token: token })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { adharNumber, password } = req.body;
        const user = await User.findOne({ adharNumber: adharNumber });
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!user || !isPasswordMatch) {
            return res.status(404).json({
                message: "Invalid username or password",
                success: false
            })
        }
        const payload = {
            id: user.id
        }
        const token = generateToken(payload)
        res.cookie("token", token)

        res.json({ token })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        // const userData = req.body;
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

router.put('/profile/update', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordMatch) {
            return res.status(404).json({
                message: "Incorrect password.",
                success: false
            })
        }
        const hashNewPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashNewPassword;

        await user.save()
        res.status(200).json({ message: "Password updated" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

module.exports = router;