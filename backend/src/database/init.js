import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    console.log('🚀 Initializing database...');
    
    try {
        // Read SQL schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('✅ Database initialized successfully!');
        console.log('📊 Created tables:');
        console.log('   - users');
        console.log('   - game_rooms');
        console.log('   - game_history');
        console.log('   - items');
        console.log('   - player_items');
        console.log('   - leaderboard');
        console.log('');
        console.log('👤 Default admin account:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run initialization
initializeDatabase()
    .then(() => {
        console.log('✅ Database setup complete!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Database setup failed:', err);
        process.exit(1);
    });

