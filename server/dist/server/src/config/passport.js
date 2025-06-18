"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const passport_linkedin_oauth2_1 = require("passport-linkedin-oauth2");
const passport_instagram_1 = require("passport-instagram");
const User_1 = require("../models/User");
const auth_config_1 = require("./auth.config");
const configurePassport = () => {
    passport_1.default.use(new passport_jwt_1.Strategy({
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: auth_config_1.jwtConfig.secret,
    }, async (payload, done) => {
        try {
            const user = await User_1.User.findById(payload.userId);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: auth_config_1.authConfig.google.clientId,
        clientSecret: auth_config_1.authConfig.google.clientSecret,
        callbackURL: auth_config_1.authConfig.google.callbackURL,
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c;
        try {
            let user = await User_1.User.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
            if (!user) {
                user = await User_1.User.create({
                    email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                    name: profile.displayName,
                    profilePicture: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                    authMethods: { google: true },
                    preferredAuthMethod: 'google'
                });
            }
            else if (!user.authMethods.google) {
                user.authMethods.google = true;
                await user.save();
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    passport_1.default.use(new passport_facebook_1.Strategy({
        clientID: auth_config_1.authConfig.facebook.clientId,
        clientSecret: auth_config_1.authConfig.facebook.clientSecret,
        callbackURL: auth_config_1.authConfig.facebook.callbackURL,
        profileFields: ['id', 'emails', 'name', 'picture'],
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c, _d, _e;
        try {
            let user = await User_1.User.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
            if (!user) {
                user = await User_1.User.create({
                    email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                    name: `${(_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName} ${(_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName}`,
                    profilePicture: (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0].value,
                    authMethods: { facebook: true },
                    preferredAuthMethod: 'facebook'
                });
            }
            else if (!user.authMethods.facebook) {
                user.authMethods.facebook = true;
                await user.save();
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    passport_1.default.use(new passport_linkedin_oauth2_1.Strategy({
        clientID: auth_config_1.authConfig.linkedin.clientId,
        clientSecret: auth_config_1.authConfig.linkedin.clientSecret,
        callbackURL: auth_config_1.authConfig.linkedin.callbackURL,
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c;
        try {
            let user = await User_1.User.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
            if (!user) {
                user = await User_1.User.create({
                    email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                    name: profile.displayName,
                    profilePicture: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                    authMethods: { linkedin: true },
                    preferredAuthMethod: 'linkedin'
                });
            }
            else if (!user.authMethods.linkedin) {
                user.authMethods.linkedin = true;
                await user.save();
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    passport_1.default.use(new passport_instagram_1.Strategy({
        clientID: auth_config_1.authConfig.instagram.clientId,
        clientSecret: auth_config_1.authConfig.instagram.clientSecret,
        callbackURL: auth_config_1.authConfig.instagram.callbackURL,
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c;
        try {
            let user = await User_1.User.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
            if (!user) {
                user = await User_1.User.create({
                    email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                    name: profile.displayName,
                    profilePicture: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                    authMethods: { instagram: true },
                    preferredAuthMethod: 'instagram'
                });
            }
            else if (!user.authMethods.instagram) {
                user.authMethods.instagram = true;
                await user.save();
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
};
exports.configurePassport = configurePassport;
//# sourceMappingURL=passport.js.map