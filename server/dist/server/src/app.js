"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const user_1 = __importDefault(require("./routes/user"));
const admin_1 = require("./routes/admin");
const audio_1 = require("./routes/audio");
const error_1 = __importDefault(require("./routes/error"));
const adminUser_1 = require("./models/adminUser");
const path_1 = __importDefault(require("path"));
const message_1 = require("./routes/message");
const post_1 = require("./routes/post");
const pg_1 = require("pg");
const config_1 = require("./config");
const app = (0, express_1.default)();
const pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl
});
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('PostgreSQL connection error:', err));
app.locals.db = pool;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
(0, passport_2.configurePassport)();
(0, adminUser_1.initializeGodModeUser)().catch(console.error);
app.use('/api/users', user_1.default);
app.use('/api/admin', admin_1.adminRoutes);
app.use('/api/audio', audio_1.audioRoutes);
app.use('/api/error', error_1.default);
app.use('/api/messages', message_1.messageRoutes);
app.use('/api/posts', post_1.postRoutes);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
exports.default = app;
//# sourceMappingURL=app.js.map