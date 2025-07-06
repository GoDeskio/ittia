"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const backupCron_1 = require("./cron/backupCron");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const emotion_1 = require("./routes/emotion");
const audio_1 = require("./routes/audio");
const db_1 = require("./db");
const voice_1 = __importDefault(require("./routes/voice"));
const assistant_1 = __importDefault(require("./routes/assistant"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('/health/dependencies', async (_req, res) => {
    const status = {
        database: false,
        redis: false,
        server: true
    };
    try {
        await (0, db_1.testConnection)();
        status.database = true;
    }
    catch (error) {
        console.error('Database health check failed:', error);
    }
    try {
        status.redis = true;
    }
    catch (error) {
        console.error('Redis health check failed:', error);
    }
    res.json(status);
});
async function startServer() {
    console.log('Starting server initialization...');
    let dbConnected = false;
    let retries = 0;
    const maxRetries = 10;
    while (!dbConnected && retries < maxRetries) {
        try {
            console.log(`Attempting to connect to database (attempt ${retries + 1}/${maxRetries})...`);
            await (0, db_1.initializeDatabase)();
            await (0, db_1.testConnection)();
            dbConnected = true;
            console.log('Successfully connected to the database!');
        }
        catch (error) {
            retries++;
            console.error(`Failed to connect to database (attempt ${retries}/${maxRetries}):`, error);
            if (retries >= maxRetries) {
                console.error('Maximum database connection retries reached. Exiting...');
                process.exit(1);
            }
            console.log(`Waiting 5 seconds before retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    let redisConnected = false;
    retries = 0;
    while (!redisConnected && retries < maxRetries) {
        try {
            console.log(`Attempting to connect to Redis (attempt ${retries + 1}/${maxRetries})...`);
            redisConnected = true;
            console.log('Successfully connected to Redis!');
        }
        catch (error) {
            retries++;
            console.error(`Failed to connect to Redis (attempt ${retries}/${maxRetries}):`, error);
            if (retries >= maxRetries) {
                console.error('Maximum Redis connection retries reached. Exiting...');
                process.exit(1);
            }
            console.log(`Waiting 5 seconds before retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    try {
        console.log('Initializing backup cron job...');
        (0, backupCron_1.initializeBackupCron)();
        console.log('Backup cron job initialized successfully!');
    }
    catch (error) {
        console.error('Failed to initialize backup cron job:', error);
    }
    console.log('Registering API routes...');
    app.use('/api/auth', auth_1.default);
    app.use('/api/users', user_1.default);
    app.use('/api/voice', voice_1.default);
    app.use('/api/assistant', assistant_1.default);
    app.use('/api/emotion', emotion_1.emotionRoutes);
    app.use('/api/audio', audio_1.audioRoutes);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`✅ Server successfully started and running on port ${PORT}`);
        console.log(`Health check available at: http://localhost:${PORT}/health`);
        console.log(`Dependencies status available at: http://localhost:${PORT}/health/dependencies`);
    });
}
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
console.log('Initializing VoiceVault server...');
startServer().catch(error => {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map