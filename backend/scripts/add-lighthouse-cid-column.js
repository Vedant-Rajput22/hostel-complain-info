import { query as db } from '../src/config/db.js';

async function addLighthouseCidColumn() {
    try {
        console.log('Adding lighthouse_cid column to complaints table...');

        // Check if column already exists
        const columns = await db('SHOW COLUMNS FROM complaints LIKE "lighthouse_cid"');

        if (columns.length > 0) {
            console.log('Column lighthouse_cid already exists. Skipping migration.');
            process.exit(0);
        }

        // Add the column
        await db('ALTER TABLE complaints ADD COLUMN lighthouse_cid VARCHAR(100) AFTER image_url');

        console.log('Successfully added lighthouse_cid column to complaints table!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding lighthouse_cid column:', error);
        process.exit(1);
    }
}

addLighthouseCidColumn();

