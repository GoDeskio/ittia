"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var config_1 = require("../src/config");
var user_1 = require("../src/models/user");
var AUTHORIZED_GOD_EMAILS = [
// Add your authorized god mode user emails here
// Example: 'admin@voicevault.com'
];
function removeUnauthorizedGodRoles() {
    return __awaiter(this, void 0, void 0, function () {
        var godUsers, removedCount, preservedCount, preservedUsers, demotedUsers, _i, godUsers_1, user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 11]);
                    // Connect to MongoDB
                    return [4 /*yield*/, mongoose_1.default.connect(config_1.config.mongoUri)];
                case 1:
                    // Connect to MongoDB
                    _a.sent();
                    console.log('Connected to MongoDB');
                    return [4 /*yield*/, user_1.User.find({ role: 'god' })];
                case 2:
                    godUsers = _a.sent();
                    console.log("Found ".concat(godUsers.length, " users with 'god' role"));
                    removedCount = 0;
                    preservedCount = 0;
                    preservedUsers = [];
                    demotedUsers = [];
                    _i = 0, godUsers_1 = godUsers;
                    _a.label = 3;
                case 3:
                    if (!(_i < godUsers_1.length)) return [3 /*break*/, 7];
                    user = godUsers_1[_i];
                    if (!!AUTHORIZED_GOD_EMAILS.includes(user.email.toLowerCase())) return [3 /*break*/, 5];
                    // Remove god role from unauthorized users
                    return [4 /*yield*/, user_1.User.findByIdAndUpdate(user._id, {
                            $set: { role: 'admin' } // Demote to admin instead of regular user for safety
                        })];
                case 4:
                    // Remove god role from unauthorized users
                    _a.sent();
                    removedCount++;
                    demotedUsers.push(user.email);
                    return [3 /*break*/, 6];
                case 5:
                    preservedCount++;
                    preservedUsers.push(user.email);
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    // Print results
                    console.log('\nMigration Results:');
                    console.log('------------------');
                    console.log("Total god users processed: ".concat(godUsers.length));
                    console.log("God roles preserved: ".concat(preservedCount));
                    console.log("God roles removed: ".concat(removedCount));
                    if (preservedUsers.length > 0) {
                        console.log('\nPreserved god access for:');
                        preservedUsers.forEach(function (email) { return console.log("- ".concat(email)); });
                    }
                    if (demotedUsers.length > 0) {
                        console.log('\nRemoved god access from:');
                        demotedUsers.forEach(function (email) { return console.log("- ".concat(email)); });
                    }
                    return [3 /*break*/, 11];
                case 8:
                    error_1 = _a.sent();
                    console.error('Error during migration:', error_1);
                    return [3 /*break*/, 11];
                case 9: 
                // Close MongoDB connection
                return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 10:
                    // Close MongoDB connection
                    _a.sent();
                    console.log('\nDisconnected from MongoDB');
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
removeUnauthorizedGodRoles();
