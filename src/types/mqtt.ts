// MQTT Broker Configuration
export interface MqttBrokerConfig {
  host?: string;
  port?: number;
  path?: string;
  clientId?: string;
  useSSL?: boolean;
  username?: string;
  password?: string;
}

// MQTT Message
export interface MqttMessage {
  destinationName: string;
  payloadString: string;
  payloadBytes?: Uint8Array;
  qos?: number;
  retained?: boolean;
  duplicate?: boolean;
}

// MQTT Connection Response
export interface MqttConnectionResponse {
  errorCode: number;
  errorMessage: string;
}

// MQTT Hook Return Type
export interface UseMqttReturn {
  client: any; // Paho MQTT Client
  isConnected: boolean;
  messages: string[];
  subscribe: (topic: string) => void;
  publish: (topic: string, message: string) => void;
  disconnect: () => void;
}

// Parsed Message Type
export interface ParsedMessage {
  message: string;
  timestamp: string;
}

// MqttTest Component Props
export interface MqttTestProps {
  isConnected: boolean;
  onPublish: (message: string) => void;
}

