const dgram = require("dgram");
const winston = require("winston");
const { WispInterface } = require("./wisp");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "/app/logs/server.log" })
  ]
});

(async () => {
  const domain = process.env.DOMAIN;
  if (!domain) { throw new Error("DOMAIN environment variable not set"); }

  const uuid = process.env.UUID;
  if (!uuid) { throw new Error("UUID environment variable not set"); }

  const token = process.env.TOKEN;
  if (!token) { throw new Error("TOKEN environment variable not set"); }

  const wisp = new WispInterface(domain, uuid, token, logger);
  await wisp.connect();

  const ddClient = dgram.createSocket("udp4");
  const receiveMessage = (message: string) => {
    logger.info(`Console: ${message}`);

    ddClient.send(message, 0, message.length, 56543, "datadog", (err: any) => {
      if (err) {
        logger.error(`Error sending message to DataDog: ${err}`);
      }
    });
  }

  wisp.receiveConsoleMessage(receiveMessage);
})();
