"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'CustomError';
    }
}
exports.CustomError = CustomError;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }
    return res.status(500).json({
        error: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map