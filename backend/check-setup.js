/**
 * Script kiểm tra Database Setup
 * Chạy: node check-setup.js
 */

import pkg from 'pg';
const { Client } = pkg;
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

console.log('🔍 ===============================================');
console.log('🔍  BattleShip Database Setup Checker');
console.log('🔍 ===============================================\n');

// Check 1: .env file exists
async function checkEnvFile() {
    console.log('📄 Checking .env file...');
    
    if (!process.env.DB_HOST) {
        checks.failed.push('.env file: Missing or not configured');
        console.log('   ❌ .env file missing or not configured');
        console.log('   💡 Run: copy .env.example .env\n');
        return false;
    }
    
    checks.passed.push('.env file exists');
    console.log('   ✅ .env file found\n');
    return true;
}

// Check 2: PostgreSQL connection
async function checkPostgreSQL() {
    console.log('🐘 Checking PostgreSQL connection...');
    
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: 'postgres', // Connect to default database first
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        console.log('   ✅ PostgreSQL is running');
        console.log(`   📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        
        // Check if battleship_db exists
        const result = await client.query(
            "SELECT datname FROM pg_database WHERE datname = 'battleship_db'"
        );
        
        if (result.rows.length === 0) {
            checks.warnings.push('Database battleship_db does not exist');
            console.log('   ⚠️  Database "battleship_db" not found');
            console.log('   💡 Run: npm run init-db\n');
        } else {
            checks.passed.push('PostgreSQL connected and battleship_db exists');
            console.log('   ✅ Database "battleship_db" exists\n');
        }
        
        await client.end();
        return true;
    } catch (error) {
        checks.failed.push(`PostgreSQL: ${error.message}`);
        console.log('   ❌ Cannot connect to PostgreSQL');
        console.log(`   ❌ Error: ${error.message}`);
        console.log('   💡 Make sure PostgreSQL is running');
        console.log('   💡 Check credentials in .env file\n');
        return false;
    }
}

// Check 3: Database tables
async function checkTables() {
    console.log('📊 Checking database tables...');
    
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'battleship_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        
        const expectedTables = [
            'users',
            'game_rooms',
            'game_history',
            'items',
            'player_items',
            'leaderboard'
        ];
        
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const existingTables = result.rows.map(row => row.table_name);
        const missingTables = expectedTables.filter(t => !existingTables.includes(t));
        
        if (missingTables.length > 0) {
            checks.warnings.push(`Missing tables: ${missingTables.join(', ')}`);
            console.log('   ⚠️  Missing tables:', missingTables.join(', '));
            console.log('   💡 Run: npm run init-db\n');
        } else {
            checks.passed.push('All required tables exist');
            console.log('   ✅ All 6 tables exist:');
            existingTables.forEach(table => {
                console.log(`      - ${table}`);
            });
            console.log('');
        }
        
        await client.end();
        return true;
    } catch (error) {
        checks.failed.push(`Tables check: ${error.message}`);
        console.log('   ❌ Cannot check tables');
        console.log(`   ❌ Error: ${error.message}\n`);
        return false;
    }
}

// Check 4: Redis connection
async function checkRedis() {
    console.log('🔴 Checking Redis connection...');
    
    const redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
        },
        password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', () => {
        // Handled in try-catch
    });

    try {
        await redisClient.connect();
        await redisClient.ping();
        
        checks.passed.push('Redis connected');
        console.log('   ✅ Redis is running');
        console.log(`   📍 Host: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}\n`);
        
        await redisClient.quit();
        return true;
    } catch (error) {
        checks.failed.push(`Redis: ${error.message}`);
        console.log('   ❌ Cannot connect to Redis');
        console.log(`   ❌ Error: ${error.message}`);
        console.log('   💡 Make sure Redis is running');
        console.log('   💡 Windows: net start Redis');
        console.log('   💡 Docker: docker start battleship-redis\n');
        return false;
    }
}

// Check 5: Admin user exists
async function checkAdminUser() {
    console.log('👤 Checking admin user...');
    
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'battleship_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        
        const result = await client.query(
            "SELECT username, elo_rating FROM users WHERE username = 'admin'"
        );
        
        if (result.rows.length === 0) {
            checks.warnings.push('Admin user not found');
            console.log('   ⚠️  Admin user not found');
            console.log('   💡 Run: npm run init-db\n');
        } else {
            checks.passed.push('Admin user exists');
            console.log('   ✅ Admin user exists');
            console.log('   📍 Username: admin');
            console.log('   📍 Password: admin123 (default)');
            console.log(`   📍 ELO: ${result.rows[0].elo_rating}\n`);
        }
        
        await client.end();
        return true;
    } catch (error) {
        checks.warnings.push(`Admin check: ${error.message}`);
        console.log('   ⚠️  Cannot check admin user\n');
        return false;
    }
}

// Check 6: JWT Secret
function checkJWTSecret() {
    console.log('🔐 Checking JWT Secret...');
    
    if (!process.env.JWT_SECRET) {
        checks.warnings.push('JWT_SECRET not set');
        console.log('   ⚠️  JWT_SECRET not set in .env');
        console.log('   💡 Add JWT_SECRET to .env file\n');
        return false;
    }
    
    if (process.env.JWT_SECRET.length < 32) {
        checks.warnings.push('JWT_SECRET too short');
        console.log('   ⚠️  JWT_SECRET is too short (should be 32+ chars)');
        console.log('   💡 Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
        return false;
    }
    
    checks.passed.push('JWT_SECRET configured');
    console.log('   ✅ JWT_SECRET is configured\n');
    return true;
}

// Summary
function printSummary() {
    console.log('📋 ===============================================');
    console.log('📋  Summary');
    console.log('📋 ===============================================\n');
    
    console.log(`✅ Passed: ${checks.passed.length}`);
    checks.passed.forEach(item => {
        console.log(`   ✅ ${item}`);
    });
    console.log('');
    
    if (checks.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${checks.warnings.length}`);
        checks.warnings.forEach(item => {
            console.log(`   ⚠️  ${item}`);
        });
        console.log('');
    }
    
    if (checks.failed.length > 0) {
        console.log(`❌ Failed: ${checks.failed.length}`);
        checks.failed.forEach(item => {
            console.log(`   ❌ ${item}`);
        });
        console.log('');
    }
    
    console.log('📋 ===============================================\n');
    
    if (checks.failed.length === 0 && checks.warnings.length === 0) {
        console.log('🎉 All checks passed! You are ready to go!');
        console.log('🚀 Run: npm run dev\n');
        return true;
    } else if (checks.failed.length === 0) {
        console.log('⚠️  Setup is mostly ready but has some warnings.');
        console.log('   Fix warnings before running in production.');
        console.log('🚀 You can try: npm run dev\n');
        return true;
    } else {
        console.log('❌ Setup has critical issues. Please fix them first.');
        console.log('📖 See: DATABASE_SETUP.md for detailed instructions\n');
        return false;
    }
}

// Run all checks
async function runAllChecks() {
    try {
        await checkEnvFile();
        await checkPostgreSQL();
        await checkTables();
        await checkRedis();
        await checkAdminUser();
        checkJWTSecret();
        
        const success = printSummary();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

// Run
runAllChecks();

