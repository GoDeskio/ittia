"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserId = void 0;
const validateUserId = (req, res, next) => {
    var _a, _b;
    if (((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString()) !== req.params.userId) {
        return res.status(403).json({ message: 'Not authorized to modify this user\'s data' });
    }
    return next();
};
exports.validateUserId = validateUserId;
//# sourceMappingURL=validateUser.js.map