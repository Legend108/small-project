import winston from 'winston';

const log: winston.LoggerOptions = {
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug",
        }),
        new winston.transports.File({
            filename: "app.log", level: "debug",
        })
    ]
};

const logger = winston.createLogger(log);

if (process.env.NODE_ENV !== 'production') {
    logger.debug("Initialized logger at debug level");
}

export default logger;
