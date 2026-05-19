const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blaclist.model')
const otpModel = require('../models/otp.model')
const nodemailer = require("nodemailer")

const otpTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    
    <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center;">

        <h2 style="color:#333;">🔐 Verify Your Account</h2>

        <p style="color:#555; font-size:14px;">
            Use the OTP below to continue. This code is valid for <b>5 minutes</b>.
        </p>

        <div style="margin:25px 0;">
            <span style="
                display:inline-block;
                font-size:28px;
                letter-spacing:8px;
                font-weight:bold;
                color:#ff4d6d;
                background:#f1f1f1;
                padding:15px 25px;
                border-radius:8px;
            ">
                ${otp}
            </span>
        </div>

        <p style="color:#777; font-size:13px;">
            If you didn’t request this, ignore this email.
        </p>

    </div>
</div>
`

// ✅ PRODUCTION COOKIE CONFIG
const cookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true
}

/**
 * REGISTER
 */
async function registerUserController(req, res) {
    try {

        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

/**
 * LOGIN
 */
async function loginUserController(req, res) {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

/**
 * GOOGLE LOGIN
 */
async function googleAuthController(req, res) {
    try {

        const { username, email } = req.body

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            })
        }

        let user = await userModel.findOne({ email })

        if (!user) {

            const hashedPassword = await bcrypt.hash("google-auth-user", 10)

            user = await userModel.create({
                username: username || "Google User",
                email,
                password: hashedPassword
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            message: "Google login success",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Google authentication failed"
        })
    }
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

/**
 * SEND OTP
 */
async function sendOtpController(req, res) {
    try {

        console.log("REQ BODY:", req.body)

        const email = req.body?.email

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        await otpModel.deleteMany({ email })

        await otpModel.create({
            email,
            otp,
            expiresAt
        })

        await transporter.sendMail({
            from: `"Interview AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code 🔐",
            html: otpTemplate(otp)
        })

        return res.json({
            message: "OTP sent successfully",
            expiresIn: 300
        })

    } catch (err) {

        console.log("SEND OTP ERROR:", err)

        return res.status(500).json({
            message: "OTP send failed"
        })
    }
}

/**
 * VERIFY OTP
 */
async function verifyOtpController(req, res) {
    try {

        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email & OTP required"
            })
        }

        const otpRecord = await otpModel.findOne({ email, otp })

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }

        if (otpRecord.expiresAt < new Date()) {

            await otpModel.deleteMany({ email })

            return res.status(400).json({
                message: "OTP expired"
            })
        }

        await otpModel.deleteMany({ email })

        let user = await userModel.findOne({ email })

        if (!user) {

            const hashedPassword = await bcrypt.hash("otp-user", 10)

            user = await userModel.create({
                username: email.split("@")[0],
                email,
                password: hashedPassword
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            message: "OTP verified",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "OTP verification failed"
        })
    }
}

/**
 * RESET PASSWORD
 */
async function resetPasswordController(req, res) {
    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        user.password = hash

        await user.save()

        res.status(200).json({
            message: "Password updated successfully"
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

/**
 * LOGOUT
 */
async function logoutUserController(req, res) {
    try {

        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", cookieOptions)

        res.status(200).json({
            message: "User logged out successfully"
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

/**
 * GET ME
 */
async function getMeController(req, res) {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                debug: req.user.id
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleAuthController,
    sendOtpController,
    verifyOtpController,
    resetPasswordController
}