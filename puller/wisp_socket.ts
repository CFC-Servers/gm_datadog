import { io, Socket } from "socket.io-client";

interface ConsoleMessage {
  type: string;
  line: string;
}

interface ServerToClientEvents {
  "error": (message: string) => void;
  "auth_success": (message: string) => void;
  "console": (message: ConsoleMessage) => void;
}

interface ClientToServerEvents {
  "auth": (token: string) => void;
}

export interface WispSocket {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  logger: any;
}

export class WispSocket {
  constructor(logger: any) {
    this.logger = logger;
  }

  connect(url: string, token: string) {
    return new Promise<void>((resolve, reject) => {
      this.socket = io(url, {
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });

      this.socket.on("connect", () => {
        this.logger.info("Connected to WebSocket");
        this.socket.emit("auth", token);
      });

      this.socket.on("disconnect", () => {
        this.logger.info("Disconnected from WebSocket");
      });

      this.socket.on("error", (error) => {
        this.logger.error(`WebSocket error: ${error}`);
        reject();
      });

      this.socket.on("auth_success", () => {
        this.logger.info("Auth success");
        resolve();
      });
    });
  }

  receiveConsoleMessage(callback: (message: string) => void) {
    this.socket.on("console", (data: ConsoleMessage) => {
      callback(data.line);
    });
  }
}
