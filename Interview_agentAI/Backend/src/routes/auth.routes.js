const { Router } = require('express')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = Router()

/**
 *  @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post('/register', authController.registerUserController)

/**
 *  @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */

authRouter.post('/login', authController.loginUserController)

/**
 *  @route GEt /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */

authRouter.get('/logout', authController.logoutUserController)

/**
 *  @route POST /api/auth/google
 * @description Google authentication
 * @access Public
 */
authRouter.post('/google', authController.googleAuthController)

/**
 *  @route POST /api/auth/send-otp
 * @description send otp to user email for passwordless login
 * @access Public
 */
authRouter.post('/send-otp', authController.sendOtpController)

/**
 * @route POST /api/auth/verify-otp
 * @description verify the otp sent to user email and login the user
 * @access Public
 */
authRouter.post('/verify-otp', authController.verifyOtpController)

/**
 * @route POST /api/auth/reset-password
 * @description send password reset link to user email
 * @access Public
 */
authRouter.post('/reset-password', authController.resetPasswordController)

/**
 *  @route GEt /api/auth/get-me
 * @description get the current logged in user details
 * @access Private
 */

authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController)


module.exports = authRouter
