"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGod = exports.isAdmin = exports.auth = exports.authenticateUser = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            id: user.id.toString(),
            email: user.email,
            role: user.is_admin ? 'admin' : 'user'
        };
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateUser = authenticateUser;
exports.auth = exports.authenticateToken;
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'god') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.isAdmin = isAdmin;
const isGod = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (req.user.role !== 'god') {
            return res.status(403).json({ message: 'God access required' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.isGod = isGod;
//# sourceMappingURL=auth.js.map