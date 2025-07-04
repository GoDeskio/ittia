"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
exports.validateGPSCoordinates = validateGPSCoordinates;
const getLocation = async () => {
    const latitude = (Math.random() * 180) - 90;
    const longitude = (Math.random() * 360) - 180;
    return {
        latitude,
        longitude,
        timestamp: new Date()
    };
};
exports.getLocation = getLocation;
function validateGPSCoordinates(latitude, longitude) {
    return (latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180);
}
//# sourceMappingURL=gps.js.map