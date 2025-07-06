"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiToken = generateApiToken;
exports.validateApiToken = validateApiToken;
exports.hashApiToken = hashApiToken;
const crypto_1 = __importDefault(require("crypto"));
async function generateApiToken() {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(new Error('Failed to generate API token'));
            }
            else {
                resolve(buffer.toString('hex'));
            }
        });
    });
}
function validateApiToken(token) {
    return /^[0-9a-f]{64}$/.test(token);
}
function hashApiToken(token) {
    return crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
}
//# sourceMappingURL=token.js.map