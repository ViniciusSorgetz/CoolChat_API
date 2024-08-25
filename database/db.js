const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbName = process.env.DB_NAME;
const password = process.env.PASSWORD;
const dbUser = process.env.DB_USER;

module.exports = connect = async () => {
    mongoose.connect(`mongodb+srv://Rexzinho:${password}@coolchatdb.9j5iy.mongodb.net/?retryWrites=true&w=majority&appName=CoolChatDB`)
}
