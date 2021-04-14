import express from "express";
import helmet from 'helmet';
import compression from 'compression';
import indexRouter from './routes/index';
import logger, { timeNow } from './utils/logger';
import "./config/passport";
const app = express();

app.use(express.json());
app.use(helmet());
app.use(compression());

// TODO add error handler to error controller
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    if (err.statusCode) {
        res.status(err.statusCode);
    }
    if (process.env.NODE_ENV === "development") {
        res.send(err);
    } else {
        logger.debug("Error encountered in app -> " + timeNow);
        res.status(500).json({ message: "Error" });
    }
})

app.use(indexRouter);

export default app;
