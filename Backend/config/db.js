const mongoose = require('mongoose');

// How many times to retry the initial connection before giving up
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (attempt = 1) => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
        console.error(
            '[DB] No connection string found. Set MONGO_URI (or MONGODB_URI) in your .env file.'
        );
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // fail fast instead of hanging
            socketTimeoutMS: 45000,
            family: 4, // prefer IPv4, avoids some SRV/DNS resolution issues on certain networks
            maxPoolSize: 20,
            minPoolSize: 5,
        });
        console.log('[DB] MongoDB Connected...');
    } catch (err) {
        console.error(`[DB] Connection attempt ${attempt} failed: ${err.message}`);

        // Give a clearer hint for the most common failure mode
        if (err.message && err.message.includes('querySrv')) {
            console.error(
                '[DB] This looks like a DNS SRV lookup failure, not a credentials/server problem.\n' +
                '     Things to check:\n' +
                '       1. Is your network blocking DNS SRV queries (common on corporate/VPN/some ISPs)?\n' +
                '          Try: nslookup -type=SRV _mongodb._tcp.<your-cluster-host>\n' +
                '       2. Try switching your DNS to 8.8.8.8 or 1.1.1.1.\n' +
                '       3. In Atlas, use the "Standard connection string" (mongodb://) instead of\n' +
                '          the SRV one (mongodb+srv://) — it lists hosts directly and skips DNS SRV.\n' +
                '       4. Confirm the cluster is not paused and your IP is whitelisted in Network Access.'
            );
        }

        if (attempt < MAX_RETRIES) {
            console.log(`[DB] Retrying in ${RETRY_DELAY_MS / 1000}s... (${attempt}/${MAX_RETRIES})`);
            await sleep(RETRY_DELAY_MS);
            return connectDB(attempt + 1);
        }

        console.error('[DB] Max retries reached. Exiting.');
        process.exit(1);
    }
};

module.exports = connectDB;