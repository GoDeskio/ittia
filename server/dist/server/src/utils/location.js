"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
const getLocation = async () => {
    return {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        timestamp: new Date()
    };
};
exports.getLocation = getLocation;
//# sourceMappingURL=location.js.map