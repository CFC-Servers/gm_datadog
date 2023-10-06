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

rotateTransport.on("rotate", function(oldFilename, newFilename) {
    logger.info(`Handling rotation: ${oldFilename} -> ${newFilename}`);
    const fileName = path.basename(oldFilename);

    axios.post("http://wisp-logs-uploader:3000/upload", {
        serverName: serverName,
        fileName: fileName
    }).then((result) => {
        logger.info(`Upload request: ${result.status}`);
    }).catch((reason) => {
        logger.error(`Upload request failed: ${reason}`);
    });
});
