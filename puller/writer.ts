import * as path from 'path';
import axios from 'axios';
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const serverName = process.env.SERVER_NAME;
if (!serverName) { throw new Error("SERVER_NAME environment variable not set"); }

const rotateTransport: DailyRotateFile = new DailyRotateFile({
  dirname: "/app/logs",
  filename: "%DATE%.log",
  datePattern: 'YYYY-MM-DD',
  maxFiles: "14d",
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.printf(({ _, __, message }) => {
      return message;
    })
  ),
  transports: [
    rotateTransport,
    new winston.transports.Console(),
  ],
});

// Logs things that we do
const metaLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "/app/logs/file-uploader.log" })
  ],
});

rotateTransport.on("rotate", function(oldFilename, newFilename) {
    metaLogger.info(`Handling rotation: ${oldFilename} -> ${newFilename}`);
    const fileName = path.basename(oldFilename);

    axios.post("http://wisp-logs-uploader:3000/upload", {
        serverName: serverName,
        fileName: fileName
    }).then((result) => {
        metaLogger.info(`Upload request: ${result.status}`);
    }).catch((reason) => {
        metaLogger.error(`Upload request failed: ${reason}`);
    });
});
