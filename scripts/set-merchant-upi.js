/**
 * Script: set-merchant-upi.js
 * Easily configures your personal or business UPI ID and Payee Name across
 * the Flipkart store backend and YouPI Payment Gateway SQLite database.
 * 
 * Usage:
 *   node scripts/set-merchant-upi.js <YOUR_UPI_ID> [PAYEE_NAME]
 * Example:
 *   node scripts/set-merchant-upi.js 9876543210@ybl "Flipkart Payments"
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendEnvPath = path.join(rootDir, 'backend', 'config', 'config.env');
const youpiEnvPath = path.join(rootDir, 'Payment gateway', 'YouPI-PG-main', '.env');
const sqliteDbPath = path.join(rootDir, 'Payment gateway', 'YouPI-PG-main', 'data', 'youpi_pg.sqlite');

// 1. Determine UPI ID and Payee Name from CLI args or existing config
let newUpiId = process.argv[2];
let newPayeeName = process.argv.slice(3).join(' ') || 'Flipkart Payments';

if (!newUpiId) {
    if (fs.existsSync(backendEnvPath)) {
        const content = fs.readFileSync(backendEnvPath, 'utf8');
        const matchUpi = content.match(/^MERCHANT_UPI_ID=(.*)$/m);
        const matchName = content.match(/^MERCHANT_PAYEE_NAME=(.*)$/m);
        if (matchUpi && matchUpi[1].trim()) newUpiId = matchUpi[1].trim();
        if (matchName && matchName[1].trim()) newPayeeName = matchName[1].trim();
    }
}

if (!newUpiId || newUpiId === 'merchant@upi') {
    newUpiId = 'flipkartpayments@upi';
}

console.log('------------------------------------------------------------');
console.log('   FLIPKART PAYMENTS / BANK UPI CONFIGURATION               ');
console.log('------------------------------------------------------------');
console.log(`Configuring Payee UPI ID : ${newUpiId}`);
console.log(`Configuring Payee Name   : ${newPayeeName}`);

// 2. Update backend/config/config.env
if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    if (/^MERCHANT_UPI_ID=/m.test(backendEnv)) {
        backendEnv = backendEnv.replace(/^MERCHANT_UPI_ID=.*$/m, `MERCHANT_UPI_ID=${newUpiId}`);
    } else {
        backendEnv += `\nMERCHANT_UPI_ID=${newUpiId}\n`;
    }

    if (/^MERCHANT_PAYEE_NAME=/m.test(backendEnv)) {
        backendEnv = backendEnv.replace(/^MERCHANT_PAYEE_NAME=.*$/m, `MERCHANT_PAYEE_NAME=${newPayeeName}`);
    } else {
        backendEnv += `MERCHANT_PAYEE_NAME=${newPayeeName}\n`;
    }

    if (!/^AUTO_VERIFY_PAYMENT=/m.test(backendEnv)) {
        backendEnv += `AUTO_VERIFY_PAYMENT=true\n`;
    }

    fs.writeFileSync(backendEnvPath, backendEnv, 'utf8');
    console.log('[OK] Updated backend/config/config.env');
}

// 3. Update Payment gateway/YouPI-PG-main/.env
if (fs.existsSync(youpiEnvPath)) {
    let youpiEnv = fs.readFileSync(youpiEnvPath, 'utf8');
    if (/^DEFAULT_PAYEE_VPA=/m.test(youpiEnv)) {
        youpiEnv = youpiEnv.replace(/^DEFAULT_PAYEE_VPA=.*$/m, `DEFAULT_PAYEE_VPA="${newUpiId}"`);
    } else {
        youpiEnv += `\nDEFAULT_PAYEE_VPA="${newUpiId}"\n`;
    }

    if (/^DEFAULT_MERCHANT_NAME=/m.test(youpiEnv)) {
        youpiEnv = youpiEnv.replace(/^DEFAULT_MERCHANT_NAME=.*$/m, `DEFAULT_MERCHANT_NAME="${newPayeeName}"`);
    } else {
        youpiEnv += `DEFAULT_MERCHANT_NAME="${newPayeeName}"\n`;
    }

    fs.writeFileSync(youpiEnvPath, youpiEnv, 'utf8');
    console.log('[OK] Updated Payment gateway/YouPI-PG-main/.env');
}

// 4. Update YouPI SQLite Database
if (fs.existsSync(sqliteDbPath)) {
    try {
        const Database = require(path.join(rootDir, 'Payment gateway', 'YouPI-PG-main', 'node_modules', 'better-sqlite3'));
        const db = new Database(sqliteDbPath);

        // Update receiving account
        const updateAccount = db.prepare(`
            UPDATE payment_receiving_accounts 
            SET upi_id = ?, payee_name = ?, updated_at = datetime('now')
            WHERE merchant_id = '00000000-0000-0000-0000-000000000001'
        `);
        const accountResult = updateAccount.run(newUpiId, newPayeeName);

        // Update merchant business name
        const updateMerchant = db.prepare(`
            UPDATE merchants 
            SET business_name = ?, updated_at = datetime('now')
            WHERE id = '00000000-0000-0000-0000-000000000001'
        `);
        const merchantResult = updateMerchant.run(newPayeeName);

        console.log(`[OK] Updated SQLite Database: ${accountResult.changes} receiving account(s), ${merchantResult.changes} merchant(s) updated.`);
        db.close();
    } catch (err) {
        console.warn('[Warning] SQLite update note:', err.message);
    }
}

console.log('------------------------------------------------------------');
console.log('SUCCESS! Bank UPI receiving account has been updated.');
console.log(`Every scan will now pay directly to: ${newUpiId} (${newPayeeName})`);
console.log('------------------------------------------------------------');

