import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug(".env file does not exist");
}
export const ENVIRONMENT = process.env.NODE_ENV;
// environment will be overriten by launch.json in vscode debug
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const GCS_BUCKET = prod ? process.env["GCLOUD_BUCKET_PROD"] : process.env["GCLOUD_BUCKET_DEV"];
// TODO use a local mongodb db if in development
export const TOKEN_SECRET = process.env["TOKEN_SECRET"];

const dbName = prod ? process.env["MONGO_DB"] : process.env["MONGO_DB_DEV"];
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-xyshh.mongodb.net/${dbName}`;
export const MONGODB_URI = mongoURI;

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_DB environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_DB_DEV environment variable.");
    }
    process.exit(1);
}
