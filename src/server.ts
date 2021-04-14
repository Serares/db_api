import mongoose from "mongoose";
import app from './app';
import { MONGODB_URI } from './utils/secrets';
import logger, { timeNow } from './utils/logger';
import bluebird from 'bluebird';

const PORT = process.env.PORT || 5300;
mongoose.Promise = bluebird;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(response => {
        logger.debug("DB_API Started at port " + PORT + " -> " + timeNow);
        app.listen(PORT, () => console.log("LISTENING ON PORT " + PORT))
    })
    .catch(err => {
        logger.debug("Connection ERROR " + PORT + " -> " + timeNow);
        console.log(err);
    })

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
    logger.debug('Mongoose connected to ' + MONGODB_URI + " -> " + timeNow);
});
mongoose.connection.on('error', function (err) {
    logger.debug('Mongoose connection error: ' + err + " -> " + timeNow);
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    logger.debug('Mongoose disconnected ' + " -> " + timeNow);
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
const gracefulShutdown = function (msg: string) {
    return new Promise((resolve) => {
        mongoose.connection.close(function () {
            logger.debug('Mongoose disconnected through ' + msg + " -> " + timeNow);
            resolve("Shut down");
        });
    })
};

// For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown("nodemon restart")
        .then(() => {
            process.kill(process.pid, 'SIGUSR2');
        });
});
// For app termination
process.on('SIGINT', function () {
    gracefulShutdown("app termination")
        .then(() => {
            process.exit(0);
        });
});

// App engine app termination
process.on('SIGTERM', function () {
    gracefulShutdown("App Engine termination")
        .then(() => {
            process.exit(0);
        });
});
