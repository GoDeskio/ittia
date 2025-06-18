"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_config_1 = require("../config/auth.config");
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
const auth_config_2 = require("../config/auth.config");
class AuthService {
    constructor() {
        this.googleClient = new google_auth_library_1.OAuth2Client(auth_config_2.authConfig.google.clientId);
    }
    async generateToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, auth_config_1.jwtConfig.secret, { expiresIn: auth_config_1.jwtConfig.expiresIn });
    }
    async loginWithEmail(email, password) {
        const user = await User_1.User.findOne({ email });
        if (!user || !user.authMethods.email) {
            throw new Error('Invalid credentials');
        }
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        const token = await this.generateToken(user);
        return { user, token };
    }
    async loginWithPinCode(email, pinCode) {
        const user = await User_1.User.findOne({ email });
        if (!user || !user.authMethods.pinCode) {
            throw new Error('Invalid credentials');
        }
        const isValid = await user.comparePinCode(pinCode);
        if (!isValid) {
            throw new Error('Invalid PIN code');
        }
        const token = await this.generateToken(user);
        return { user, token };
    }
    async loginWithGoogle(idToken) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: auth_config_2.authConfig.google.clientId
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error('Invalid Google token');
        let user = await User_1.User.findOne({ email: payload.email });
        if (!user) {
            user = await User_1.User.create({
                email: payload.email,
                name: payload.name,
                profilePicture: payload.picture,
                authMethods: { google: true },
                preferredAuthMethod: 'google'
            });
        }
        else if (!user.authMethods.google) {
            user.authMethods.google = true;
            await user.save();
        }
        const token = await this.generateToken(user);
        return { user, token };
    }
    async loginWithFacebook(accessToken) {
        var _a;
        const response = await axios_1.default.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        const { email, name, picture } = response.data;
        let user = await User_1.User.findOne({ email });
        if (!user) {
            user = await User_1.User.create({
                email,
                name,
                profilePicture: (_a = picture === null || picture === void 0 ? void 0 : picture.data) === null || _a === void 0 ? void 0 : _a.url,
                authMethods: { facebook: true },
                preferredAuthMethod: 'facebook'
            });
        }
        else if (!user.authMethods.facebook) {
            user.authMethods.facebook = true;
            await user.save();
        }
        const token = await this.generateToken(user);
        return { user, token };
    }
    async loginWithLinkedIn(code) {
        throw new Error('LinkedIn login not implemented');
    }
    async loginWithInstagram(code) {
        throw new Error('Instagram login not implemented');
    }
    async verifyFingerprint(userId, fingerprintHash) {
        const user = await User_1.User.findById(userId);
        if (!user || !user.authMethods.fingerprint)
            return false;
        return user.fingerPrintHash === fingerprintHash;
    }
    async updatePreferredAuthMethod(userId, method) {
        const user = await User_1.User.findById(userId);
        if (!user)
            throw new Error('User not found');
        if (!user.authMethods[method]) {
            throw new Error('Authentication method not enabled for this user');
        }
        user.preferredAuthMethod = method;
        await user.save();
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map