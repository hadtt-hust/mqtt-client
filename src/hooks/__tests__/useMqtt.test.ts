import { renderHook, act, waitFor } from "@testing-library/react";
import { Client, Message } from "paho-mqtt";
import useMqtt from "../useMqtt";
import { MqttBrokerConfig } from "../../types/mqtt";

// Mock paho-mqtt
jest.mock("paho-mqtt", () => ({
  Client: jest.fn(),
  Message: jest.fn()
}));

// Create mock client factory
const createMockClient = () => ({
  isConnected: jest.fn().mockReturnValue(false),
  connect: jest.fn(),
  disconnect: jest.fn(),
  subscribe: jest.fn(),
  send: jest.fn(),
  onConnectionLost: null as any,
  onMessageArrived: null as any
});

const MockClient = Client as jest.MockedClass<typeof Client>;
const MockMessage = Message as jest.MockedClass<typeof Message>;

describe("useMqtt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Client to return different instances
    MockClient.mockImplementation(() => createMockClient());
    MockMessage.mockImplementation(() => ({
      destinationName: "",
      payloadString: "",
      payloadBytes: new Uint8Array(),
      qos: 0,
      retained: false,
      duplicate: false
    }));
  });

  const defaultConfig: MqttBrokerConfig = {
    host: "test.broker.com",
    port: 8883,
    path: "/ws",
    clientId: "test-client",
    useSSL: true
  };

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMqtt(defaultConfig));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(typeof result.current.subscribe).toBe("function");
    expect(typeof result.current.publish).toBe("function");
    expect(typeof result.current.disconnect).toBe("function");
  });

  it("should create MQTT client on mount", () => {
    const { result } = renderHook(() => useMqtt(defaultConfig));

    expect(MockClient).toHaveBeenCalledWith(
      defaultConfig.host,
      Number(defaultConfig.port),
      defaultConfig.path,
      expect.stringContaining("test-client")
    );
    expect(result.current.client).toBeDefined();
  });

  it("should connect to MQTT broker on mount", async () => {
    const mockClient = createMockClient();
    MockClient.mockImplementation(() => mockClient);

    renderHook(() => useMqtt(defaultConfig));

    expect(mockClient.connect).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
      onFailure: expect.any(Function),
      useSSL: true
    });
  });

  it("should handle connection success", async () => {
    const mockClient = createMockClient();
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    // Simulate successful connection
    await act(async () => {
      const connectCall = mockClient.connect.mock.calls[0][0];
      connectCall.onSuccess();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it("should handle connection failure", async () => {
    const mockClient = createMockClient();
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    // Simulate connection failure
    await act(async () => {
      const connectCall = mockClient.connect.mock.calls[0][0];
      connectCall.onFailure({ errorCode: 1, errorMessage: "Connection failed" });
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("should publish messages when connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(true);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.publish("test/topic", "Hello MQTT");
    });

    expect(MockMessage).toHaveBeenCalledWith("Hello MQTT");
    expect(mockClient.send).toHaveBeenCalled();
  });

  it("should not publish when not connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(false);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.publish("test/topic", "Hello MQTT");
    });

    expect(MockMessage).not.toHaveBeenCalled();
    expect(mockClient.send).not.toHaveBeenCalled();
  });

  it("should disconnect from MQTT broker when connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(true);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.disconnect();
    });

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("should not disconnect when not connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(false);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.disconnect();
    });

    expect(mockClient.disconnect).not.toHaveBeenCalled();
  });

  it("should handle incoming messages", async () => {
    const mockClient = createMockClient();
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    // Simulate message arrival
    const mockMessage = {
      destinationName: "test/topic",
      payloadString: "Test message",
      payloadBytes: new Uint8Array(),
      qos: 0,
      retained: false,
      duplicate: false
    };

    await act(async () => {
      // Trigger onMessageArrived callback
      if (mockClient.onMessageArrived) {
        mockClient.onMessageArrived(mockMessage);
      }
    });

    await waitFor(() => {
      expect(result.current.messages).toContain("Test message");
    });
  });

  it("should handle connection lost", async () => {
    const mockClient = createMockClient();
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    // First connect successfully
    await act(async () => {
      const connectCall = mockClient.connect.mock.calls[0][0];
      connectCall.onSuccess();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Then simulate connection lost
    await act(async () => {
      if (mockClient.onConnectionLost) {
        mockClient.onConnectionLost({ errorCode: 1, errorMessage: "Connection lost" });
      }
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it("should subscribe to topic when connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(true);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.subscribe("test/topic");
    });

    expect(mockClient.subscribe).toHaveBeenCalledWith("test/topic");
  });

  it("should not subscribe when not connected", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(false);
    MockClient.mockImplementation(() => mockClient);

    const { result } = renderHook(() => useMqtt(defaultConfig));

    await act(async () => {
      result.current.subscribe("test/topic");
    });

    expect(mockClient.subscribe).not.toHaveBeenCalled();
  });

  it("should only initialize once per hook instance", () => {
    (Client as jest.MockedClass<typeof Client>).mockClear();
    renderHook(() => useMqtt(defaultConfig));
    renderHook(() => useMqtt(defaultConfig));
    expect(Client).toHaveBeenCalledTimes(2);
  });

  it("should cleanup on unmount", async () => {
    const mockClient = createMockClient();
    mockClient.isConnected.mockReturnValue(true);
    MockClient.mockImplementation(() => mockClient);

    const { unmount } = renderHook(() => useMqtt(defaultConfig));

    unmount();

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});

