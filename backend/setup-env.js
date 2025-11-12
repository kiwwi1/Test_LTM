/**
 * Auto-generate .env file with secure defaults
 * Usage: node setup-env.js
 */

import fs from 'fs';
import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('🔧 ========================================');
    console.log('🔧  BattleShip Backend Environment Setup');
    console.log('🔧 ========================================\n');

    // Check if .env already exists
    if (fs.existsSync('.env')) {
        const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Cancelled. Existing .env file preserved.');
            rl.close();
            return;
        }
    }

    console.log('\n📝 Please provide the following information:\n');

    // Get database password
    const dbPassword = await question('PostgreSQL password (default: postgres123): ') || 'postgres123';

    // Generate JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log('\n✅ Generated secure JWT_SECRET');

    // Redis password (optional)
    const redisPassword = await question('Redis password (leave empty if none): ') || '';

    // Create .env content
    const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battleship_db
DB_USER=postgres
DB_PASSWORD=${dbPassword}

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${redisPassword}

# JWT Secret (Auto-generated)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# C TCP Server
TCP_SERVER_HOST=localhost
TCP_SERVER_PORT=8888

# CORS
CORS_ORIGIN=http://localhost:5173
`;

    // Write to .env file
    fs.writeFileSync('.env', envContent);

    console.log('\n✅ .env file created successfully!\n');
    console.log('📋 Configuration:');
    console.log('   - PostgreSQL password: ' + dbPassword);
    console.log('   - JWT Secret: ' + jwtSecret.substring(0, 16) + '... (64 chars)');
    if (redisPassword) {
        console.log('   - Redis password: Set');
    }
    console.log('\n🚀 Next steps:');
    console.log('   1. Initialize database: npm run init-db');
    console.log('   2. Start backend: npm run dev');
    console.log('   3. Check setup: npm run check-setup\n');

    rl.close();
}

setup().catch(console.error);

