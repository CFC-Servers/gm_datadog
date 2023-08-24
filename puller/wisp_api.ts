const axios = require("axios");

type RequestTypes = "GET" | "POST" | "PUT" | "DELETE";

interface RequestData {
  headers: {[key: string]: string};
  params?: {[key: string]: any};
}

export interface WispAPI {
  domain: string;
  uuid: string;
  token: string;
  logger: any;
}

export class WispAPI {
  constructor(domain: string, uuid: string, token: string, logger: any) {
    this.domain = domain;
    this.uuid = uuid;
    this.token = token;
    this.logger = logger;
  }

  makeURL(path: string) {
    return `${this.domain}/api/client/servers/${this.uuid}/${path}`;
  }

  async makeRequest(method: RequestTypes, path: string, data?: any) {
    const url = this.makeURL(path);
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/vnd.wisp.v1+json",
      "Authorization": `Bearer ${this.token}`
    };

    const request = async () => {
      let response;
      const requestData: RequestData = { headers: headers }

      if (method == "GET") {
        if (data !== null) {
          requestData.params = data;
        }

        response = await axios.get(url, requestData);
      } else if (method == "POST") {
        response = await axios.post(url, data, requestData);
      } else if (method == "DELETE") {
        response = await axios.delete(url, requestData);
      } else if (method == "PUT") {
        response = await axios.put(url, data, requestData);
      } else {
        throw new Error(`Invalid method: ${method}`);
      }

      return response;
    }

    this.logger.info(`Sending ${method} request to ${url}`);
    return await request();
  }

  async getWebsocketDetails() {
    const response = await this.makeRequest("GET", "websocket");
    return response.data;
  }
}

