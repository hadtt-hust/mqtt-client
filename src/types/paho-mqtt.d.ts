declare module "paho-mqtt" {
  export class Client {
    constructor(host: string, port: number, path: string, clientId: string);

    isConnected(): boolean;
    connect(options: {
      onSuccess?: () => void;
      onFailure?: (error: { errorCode: number; errorMessage: string }) => void;
      useSSL?: boolean;
    }): void;
    disconnect(): void;
    subscribe(topic: string): void;
    send(message: Message): void;

    onConnectionLost: (responseObject: { errorCode: number; errorMessage: string }) => void;
    onMessageArrived: (message: Message) => void;
  }

  export class Message {
    constructor(payload: string);
    destinationName: string;
    payloadString: string;
    payloadBytes?: Uint8Array;
    qos?: number;
    retained?: boolean;
    duplicate?: boolean;
  }
}

declare global {
  interface Window {
    Paho: {
      MQTT: {
        Client: typeof import("paho-mqtt").Client;
        Message: typeof import("paho-mqtt").Message;
      };
    };
  }
}
