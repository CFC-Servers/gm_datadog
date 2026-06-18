import dgram from "dgram"
import stripAnsi from 'strip-ansi';
import { WispInterface } from "wispjs";
import { logger } from "./writer.js";

(async () => {
  const domain = process.env.DOMAIN;
  if (!domain) { throw new Error("DOMAIN environment variable not set"); }

  const uuid = process.env.UUID;
  if (!uuid) { throw new Error("UUID environment variable not set"); }

  const token = process.env.TOKEN;
  if (!token) { throw new Error("TOKEN environment variable not set"); }

  const ddPort = process.env.DD_PORT;
  if (!ddPort) { throw new Error("DD_PORT environment variable not set"); }

  const wisp = new WispInterface(domain, uuid, token);

  const datadogPort = parseInt(ddPort, 10);
  const ddClient = dgram.createSocket("udp4");
  const receiveMessage = (message: string) => {
    const clean = stripAnsi(message);
    logger.info(clean);

    ddClient.send(clean, 0, clean.length, datadogPort, "datadog", (err: any) => {
      if (err) {
        const errMessage = `Error sending message to DataDog: ${err}: [[${clean}]]`;
        console.error(errMessage);
        logger.error(errMessage);
      }
    });
  }

  wisp.socket.addConsoleListener(receiveMessage);
})();
