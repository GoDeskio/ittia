"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMobilePermissions = void 0;
const checkMobilePermissions = (req, res, next) => {
    const isMobile = /mobile|android|iphone|ipad/i.test(req.headers['user-agent'] || '');
    if (isMobile) {
        const permissions = req.headers['x-device-permissions'];
        if (!permissions) {
            return res.status(403).json({
                error: 'Device permissions required',
                requiredPermissions: ['CAMERA', 'PHOTO_LIBRARY', 'MICROPHONE', 'STORAGE'],
                message: 'Please grant the necessary permissions to access device features'
            });
        }
    }
    return next();
};
exports.checkMobilePermissions = checkMobilePermissions;
//# sourceMappingURL=permissions.js.map