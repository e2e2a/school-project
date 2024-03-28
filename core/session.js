// Import the express-session module
const ExpressSession = require('express-session');
// Import the connect-mongodb-session module and pass the ExpressSession as a parameter
const MongoDBSessionStore = require('connect-mongodb-session')(ExpressSession);

/**
 * This function configures and returns an Express session middleware.
 * The session data is stored in a MongoDB database.
 * 
 * @returns {Function} Express session middleware configured with MongoDB session store.
 */
module.exports = () => {
    // Retrieve MongoDB connection details from environment variables
    const host = process.env.MONGO_DBHOST;
    const port = process.env.MONGO_DBPORT;
    const database = process.env.MONGO_DBNAME;
    // Construct the MongoDB connection string
    const connStr = `mongodb://${host}:${port}/${database}`;
    // Create a new MongoDB store with the connection string and collection name
    const store = new MongoDBSessionStore({
        uri: connStr,
        collection: 'sessions'
    });
    // Configure and create the Express session middleware
    let session = ExpressSession({
        // Secret used to sign the session ID cookie
        secret: 'sessionsecret777',
        cookie: {
            // Cookie expiration date (1 week from now)
            maxAge: 1000 * 60 * 60 * 24 * 7
        },
        // Don't save session if unmodified
        resave: false,
        // Save uninitialized sessions
        saveUninitialized: true,
        // Use the MongoDB store for session data
        store: store,
    })
    // Return the configured session middleware
    return session;
}