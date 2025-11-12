/**
 * Debug Authentication Script
 * Kiểm tra JWT configuration
 * 
 * Usage: node debug-auth.js
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

console.log('🔍 ========================================');
console.log('🔍  JWT Authentication Debugger');
console.log('🔍 ========================================\n');

let hasError = false;

// Check 1: .env file exists
console.log('📄 Check 1: .env file exists');
try {
    if (!process.env.JWT_SECRET) {
        console.log('   ❌ FAIL: JWT_SECRET not found in .env');
        console.log('   💡 Solution: Add JWT_SECRET to .env file');
        console.log('   💡 Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
        hasError = true;
    } else {
        console.log('   ✅ PASS: JWT_SECRET is set\n');
    }
} catch (error) {
    console.log('   ❌ FAIL: Cannot read .env file');
    console.log('   💡 Solution: Copy .env.example to .env\n');
    hasError = true;
}

// Check 2: JWT_SECRET length
if (process.env.JWT_SECRET) {
    console.log('📏 Check 2: JWT_SECRET length');
    const secretLength = process.env.JWT_SECRET.length;
    
    if (secretLength < 32) {
        console.log(`   ❌ FAIL: JWT_SECRET too short (${secretLength} chars)`);
        console.log('   💡 Should be at least 32 characters');
        console.log('   💡 Current: ' + process.env.JWT_SECRET);
        console.log('   💡 Generate new: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
        hasError = true;
    } else {
        console.log(`   ✅ PASS: JWT_SECRET length is ${secretLength} chars\n`);
    }
}

// Check 3: Can create token
if (process.env.JWT_SECRET) {
    console.log('🔐 Check 3: Can create JWT token');
    try {
        const testPayload = { userId: 1, test: true };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('   ✅ PASS: Token created successfully');
        console.log('   📝 Sample token (first 50 chars): ' + token.substring(0, 50) + '...\n');
    } catch (error) {
        console.log('   ❌ FAIL: Cannot create token');
        console.log('   ❌ Error: ' + error.message + '\n');
        hasError = true;
    }
}

// Check 4: Can verify token
if (process.env.JWT_SECRET) {
    console.log('✅ Check 4: Can verify JWT token');
    try {
        const testPayload = { userId: 1, test: true };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userId === 1 && decoded.test === true) {
            console.log('   ✅ PASS: Token verified successfully');
            console.log('   📝 Decoded payload:', decoded);
            console.log('');
        } else {
            console.log('   ❌ FAIL: Token verification mismatch\n');
            hasError = true;
        }
    } catch (error) {
        console.log('   ❌ FAIL: Cannot verify token');
        console.log('   ❌ Error: ' + error.message + '\n');
        hasError = true;
    }
}

// Check 5: JWT_EXPIRES_IN
console.log('⏰ Check 5: JWT expiration setting');
if (!process.env.JWT_EXPIRES_IN) {
    console.log('   ⚠️  WARNING: JWT_EXPIRES_IN not set (will use default)');
    console.log('   💡 Add to .env: JWT_EXPIRES_IN=7d\n');
} else {
    console.log(`   ✅ PASS: JWT_EXPIRES_IN is set to ${process.env.JWT_EXPIRES_IN}\n`);
}

// Check 6: Other important env vars
console.log('🔧 Check 6: Other environment variables');
const requiredVars = {
    'DB_HOST': process.env.DB_HOST,
    'DB_NAME': process.env.DB_NAME,
    'REDIS_HOST': process.env.REDIS_HOST,
};

let missingVars = [];
for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
        missingVars.push(key);
    }
}

if (missingVars.length > 0) {
    console.log('   ⚠️  WARNING: Missing variables: ' + missingVars.join(', '));
    console.log('   💡 Check your .env file\n');
} else {
    console.log('   ✅ PASS: All required variables are set\n');
}

// Summary
console.log('📋 ========================================');
console.log('📋  Summary');
console.log('📋 ========================================\n');

if (hasError) {
    console.log('❌ FAILED: Authentication setup has errors');
    console.log('');
    console.log('🔧 Quick Fix:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Generate JWT_SECRET:');
    console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log('3. Add JWT_SECRET to .env file');
    console.log('4. Restart backend: npm run dev');
    console.log('5. Clear browser localStorage and login again\n');
    
    // Generate a new secret for convenience
    const newSecret = crypto.randomBytes(32).toString('hex');
    console.log('💡 Generated JWT_SECRET for you:');
    console.log('   JWT_SECRET=' + newSecret);
    console.log('');
    
    process.exit(1);
} else {
    console.log('✅ SUCCESS: Authentication is configured correctly!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Make sure backend is running: npm run dev');
    console.log('2. Make sure Redis is running');
    console.log('3. If still having issues, clear browser localStorage');
    console.log('4. Login again to get a fresh token\n');
    
    process.exit(0);
}

