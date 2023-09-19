import dgram from "dgram"
import { WispInterface } from "wispjs";

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
  const ghPAT = "";

  await wisp.connect(ghPAT);

  const ddClient = dgram.createSocket("udp4");
  const receiveMessage = (message: string) => {
    console.log(`Console: ${message}`);

    ddClient.send(message, 0, message.length, parseInt(ddPort, 10), "datadog", (err: any) => {
      if (err) {
        console.error(`Error sending message to DataDog: ${err}`);
      }
    });
  }

  wisp.socket.addConsoleListener(receiveMessage);
})();
