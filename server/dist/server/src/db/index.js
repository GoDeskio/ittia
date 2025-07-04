"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initializeDatabase = initializeDatabase;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool = pool;
async function initializeDatabase() {
    try {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database schema:', error);
        throw error;
    }
}
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL');
        client.release();
    }
    catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map