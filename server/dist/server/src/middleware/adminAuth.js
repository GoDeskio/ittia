"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.requireGodMode = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminUser_1 = require("../models/adminUser");
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const admin = await adminUser_1.AdminUser.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.admin = {
            id: admin._id,
            username: admin.username,
            role: admin.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const requireGodMode = (req, res, next) => {
    var _a;
    if (((_a = req.admin) === null || _a === void 0 ? void 0 : _a.role) !== 'god') {
        return res.status(403).json({ error: 'God mode access required' });
    }
    next();
};
exports.requireGodMode = requireGodMode;
const isAdmin = async (req, res, next) => {
    var _a;
    try {
        const user = await User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user || !user.authMethods.admin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Error checking admin privileges' });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=adminAuth.js.map