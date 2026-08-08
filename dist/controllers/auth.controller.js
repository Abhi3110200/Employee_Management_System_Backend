"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const user_model_js_1 = require("../models/user.model.js");
const token_utils_js_1 = require("../utils/token.utils.js");
// Helper to set HttpOnly Cookie for Refresh Token
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide name, email, and password',
            });
            return;
        }
        const existingUser = await user_model_js_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({
                status: 'error',
                message: 'User already exists with this email',
            });
            return;
        }
        const user = new user_model_js_1.User({
            name,
            email,
            password,
            role: role || 'employee',
            refreshTokens: [],
        });
        const userPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = (0, token_utils_js_1.generateAccessToken)(userPayload);
        const refreshToken = (0, token_utils_js_1.generateRefreshToken)(userPayload);
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshTokenCookie(res, refreshToken);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Registration failed',
        });
    }
};
exports.register = register;
/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide both email and password',
            });
            return;
        }
        // Explicitly select password field
        const user = await user_model_js_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password',
            });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password',
            });
            return;
        }
        const userPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = (0, token_utils_js_1.generateAccessToken)(userPayload);
        const refreshToken = (0, token_utils_js_1.generateRefreshToken)(userPayload);
        // Keep up to 5 active sessions
        if (user.refreshTokens.length >= 5) {
            user.refreshTokens.shift();
        }
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshTokenCookie(res, refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Login failed',
        });
    }
};
exports.login = login;
/**
 * @desc    Refresh Access Token using Refresh Token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Refresh token not found',
            });
            return;
        }
        let decoded;
        try {
            decoded = (0, token_utils_js_1.verifyRefreshToken)(token);
        }
        catch (err) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid or expired refresh token',
            });
            return;
        }
        const user = await user_model_js_1.User.findById(decoded.id);
        if (!user || !user.refreshTokens.includes(token)) {
            res.status(401).json({
                status: 'error',
                message: 'Refresh token revoked or invalid',
            });
            return;
        }
        // Token rotation: Remove old refresh token, issue new token pair
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        const userPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const newAccessToken = (0, token_utils_js_1.generateAccessToken)(userPayload);
        const newRefreshToken = (0, token_utils_js_1.generateRefreshToken)(userPayload);
        user.refreshTokens.push(newRefreshToken);
        await user.save();
        setRefreshTokenCookie(res, newRefreshToken);
        res.status(200).json({
            status: 'success',
            accessToken: newAccessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Could not refresh token',
        });
    }
};
exports.refreshToken = refreshToken;
/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token) {
            try {
                const decoded = (0, token_utils_js_1.verifyRefreshToken)(token);
                const user = await user_model_js_1.User.findById(decoded.id);
                if (user) {
                    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
                    await user.save();
                }
            }
            catch (err) {
                // Ignore token verification errors during logout
            }
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Logout failed',
        });
    }
};
exports.logout = logout;
/**
 * @desc    Get Current Logged In User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authenticated',
            });
            return;
        }
        const user = await user_model_js_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch user profile',
        });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map