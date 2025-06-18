"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserId = void 0;
const validateUserId = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) !== req.params.userId) {
        return res.status(403).json({ message: 'Not authorized to modify this user\'s data' });
    }
    next();
};
exports.validateUserId = validateUserId;
//# sourceMappingURL=validateUser.js.map