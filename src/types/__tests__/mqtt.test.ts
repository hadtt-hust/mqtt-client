import {
  MqttBrokerConfig,
  MqttMessage,
  MqttConnectionResponse,
  UseMqttReturn,
  ParsedMessage,
  MqttTestProps
} from "../mqtt";

describe("MQTT Types", () => {
  describe("MqttBrokerConfig", () => {
    it("should have correct structure", () => {
      const config: MqttBrokerConfig = {
        host: "test.broker.com",
        port: 8883,
        path: "/ws",
        clientId: "test-client",
        useSSL: true
      };

      expect(config.host).toBe("test.broker.com");
      expect(config.port).toBe(8883);
      expect(config.path).toBe("/ws");
      expect(config.clientId).toBe("test-client");
      expect(config.useSSL).toBe(true);
    });

    it("should allow partial configuration", () => {
      const config: MqttBrokerConfig = {
        host: "test.broker.com"
      };

      expect(config.host).toBe("test.broker.com");
      expect(config.port).toBeUndefined();
      expect(config.path).toBeUndefined();
      expect(config.clientId).toBeUndefined();
      expect(config.useSSL).toBeUndefined();
    });
  });

  describe("MqttMessage", () => {
    it("should have correct structure", () => {
      const message: MqttMessage = {
        destinationName: "test/topic",
        payloadString: "test message",
        payloadBytes: new Uint8Array([1, 2, 3]),
        qos: 1,
        retained: false,
        duplicate: false
      };

      expect(message.destinationName).toBe("test/topic");
      expect(message.payloadString).toBe("test message");
      expect(message.payloadBytes).toEqual(new Uint8Array([1, 2, 3]));
      expect(message.qos).toBe(1);
      expect(message.retained).toBe(false);
      expect(message.duplicate).toBe(false);
    });

    it("should allow optional properties", () => {
      const message: MqttMessage = {
        destinationName: "test/topic",
        payloadString: "test message"
      };

      expect(message.destinationName).toBe("test/topic");
      expect(message.payloadString).toBe("test message");
      expect(message.payloadBytes).toBeUndefined();
      expect(message.qos).toBeUndefined();
      expect(message.retained).toBeUndefined();
      expect(message.duplicate).toBeUndefined();
    });
  });

  describe("MqttConnectionResponse", () => {
    it("should have correct structure", () => {
      const response: MqttConnectionResponse = {
        errorCode: 0,
        errorMessage: "Success"
      };

      expect(response.errorCode).toBe(0);
      expect(response.errorMessage).toBe("Success");
    });

    it("should handle error responses", () => {
      const response: MqttConnectionResponse = {
        errorCode: 1,
        errorMessage: "Connection failed"
      };

      expect(response.errorCode).toBe(1);
      expect(response.errorMessage).toBe("Connection failed");
    });
  });

  describe("UseMqttReturn", () => {
    it("should have correct structure", () => {
      const mockClient = {};
      const mockSubscribe = jest.fn();
      const mockPublish = jest.fn();
      const mockDisconnect = jest.fn();

      const hookReturn: UseMqttReturn = {
        client: mockClient,
        isConnected: true,
        messages: ["message1", "message2"],
        subscribe: mockSubscribe,
        publish: mockPublish,
        disconnect: mockDisconnect
      };

      expect(hookReturn.client).toBe(mockClient);
      expect(hookReturn.isConnected).toBe(true);
      expect(hookReturn.messages).toEqual(["message1", "message2"]);
      expect(typeof hookReturn.subscribe).toBe("function");
      expect(typeof hookReturn.publish).toBe("function");
      expect(typeof hookReturn.disconnect).toBe("function");
    });
  });

  describe("ParsedMessage", () => {
    it("should have correct structure", () => {
      const parsedMessage: ParsedMessage = {
        message: "Hello World",
        timestamp: "2023-01-01T00:00:00Z"
      };

      expect(parsedMessage.message).toBe("Hello World");
      expect(parsedMessage.timestamp).toBe("2023-01-01T00:00:00Z");
    });
  });

  describe("MqttTestProps", () => {
    it("should have correct structure", () => {
      const mockOnPublish = jest.fn();

      const props: MqttTestProps = {
        isConnected: true,
        onPublish: mockOnPublish
      };

      expect(props.isConnected).toBe(true);
      expect(typeof props.onPublish).toBe("function");
    });
  });
});
