declare module "paho-mqtt" {
  export interface MqttConnectionOptions {
    onSuccess?: () => void;
    onFailure?: (error: { errorCode: number; errorMessage: string }) => void;
    useSSL?: boolean;
    userName?: string;
    password?: string;
    timeout?: number;
    keepAliveInterval?: number;
    cleanSession?: boolean;
    willMessage?: Message;
  }

  export interface MqttSubscribeOptions {
    qos?: number;
    onSuccess?: () => void;
    onFailure?: (error: { errorCode: number; errorMessage: string }) => void;
  }

  export interface MqttPublishOptions {
    qos?: number;
    retained?: boolean;
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

  export class Client {
    constructor(host: string, port: number, path: string, clientId: string);

    connect(options: MqttConnectionOptions): void;
    disconnect(): void;
    isConnected(): boolean;

    subscribe(topic: string, options?: MqttSubscribeOptions): void;
    unsubscribe(topic: string, options?: { onSuccess?: () => void; onFailure?: (error: any) => void }): void;

    send(message: Message): void;
    publish(topic: string, payload: string, options?: MqttPublishOptions): void;

    onConnectionLost: (responseObject: { errorCode: number; errorMessage: string }) => void;
    onMessageArrived: (message: Message) => void;
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

