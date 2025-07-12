import { MqttBrokerConfig } from "../types/mqtt";

// Cấu hình MQTT Broker
export const mqttConfig: MqttBrokerConfig = {
  // Thay đổi các thông tin sau theo broker của bạn
  host: "YOUR_BROKER_IP", // Ví dụ: "192.168.1.100" hoặc "mqtt.example.com"
  port: 1883, // 1883 cho MQTT, 8883 cho MQTT over SSL
  path: "/mqtt",
  useSSL: false, // true nếu dùng SSL/TLS
  username: "YOUR_USERNAME", // Username để authenticate
  password: "YOUR_PASSWORD", // Password để authenticate
  clientId: "react-mqtt-client-" + Math.random().toString(16).substring(2, 10)
};

// Cấu hình topics
export const mqttTopics = {
  default: "psu/drone"
  // Thêm các topics khác nếu cần
  // sensor: "sensor/data",
  // control: "device/control",
  // status: "device/status"
};

// Cấu hình message format
export const messageConfig = {
  // Format message khi publish
  formatMessage: (message: string) => ({
    message,
    timestamp: new Date().toISOString(),
    clientId: mqttConfig.clientId
  }),

  // Parse message khi nhận
  parseMessage: (payload: string) => {
    try {
      return JSON.parse(payload);
    } catch {
      return { message: payload, timestamp: new Date().toISOString() };
    }
  }
};

// Các cấu hình broker phổ biến
export const brokerPresets = {
  // HiveMQ Public Broker (không cần auth)
  hivemq: {
    host: "broker.hivemq.com",
    port: 8000,
    path: "/mqtt",
    useSSL: false
  },

  // Mosquitto Local (không cần auth)
  mosquitto: {
    host: "localhost",
    port: 1883,
    path: "/mqtt",
    useSSL: false
  },

  // AWS IoT (cần certificate)
  awsIot: {
    host: "YOUR_AWS_IOT_ENDPOINT.amazonaws.com",
    port: 8883,
    path: "/mqtt",
    useSSL: true
  },

  // Eclipse Mosquitto với auth
  mosquittoAuth: {
    host: "YOUR_BROKER_IP",
    port: 1883,
    path: "/mqtt",
    useSSL: false,
    username: "YOUR_USERNAME",
    password: "YOUR_PASSWORD"
  }
};
