// Import the mongoose module
const { default: mongoose } = require("mongoose");
/**
 * Establishes a connection to the MongoDB database.
 * 
 * @returns {Promise} A promise object that resolves to the MongoDB database connection.
 * @throws Will throw an error if the connection fails.
 */
module.exports = () => {
    try {
        // Retrieve MongoDB connection details from environment variables
        const host = process.env.MONGO_DBHOST;
        const port = process.env.MONGO_DBPORT;
        const database = process.env.MONGO_DBNAME;
        // Construct the MongoDB connection string
        const connStr = `mongodb://${host}:${port}/${database}`;
        // Attempt to connect to the MongoDB database
        const conn = mongoose.connect(connStr);
        console.log('database connected');
        // Return the connection object
        return conn;
    } catch (error) {
        // Log an error message if the connection fails
        console.error(error);
    }
};