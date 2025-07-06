"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
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
};
exports.configurePassport = configurePassport;
//# sourceMappingURL=passport.js.map