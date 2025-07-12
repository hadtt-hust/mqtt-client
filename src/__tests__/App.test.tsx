import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock the useMqtt hook
jest.mock("../hooks/useMqtt", () => ({
  __esModule: true,
  default: jest.fn()
}));

const mockUseMqtt = require("../hooks/useMqtt").default;

describe("App", () => {
  const mockSubscribe = jest.fn();
  const mockPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly when not connected", () => {
    mockUseMqtt.mockReturnValue({
      client: null,
      isConnected: false,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(screen.getByText("React MQTT Application")).toBeInTheDocument();
    expect(screen.getByText("MQTT is not connected")).toBeInTheDocument();
    expect(screen.getByText("MQTT Test Panel")).toBeInTheDocument();
    expect(screen.getByText("MQTT Messages")).toBeInTheDocument();
    expect(screen.getByText("No messages received yet...")).toBeInTheDocument();
  });

  it("should render correctly when connected", () => {
    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(screen.getByText("MQTT is connected")).toBeInTheDocument();
  });

  it("should subscribe to topic when connected", () => {
    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(mockSubscribe).toHaveBeenCalledWith("psu/drone");
  });

  it("should not subscribe when not connected", () => {
    mockUseMqtt.mockReturnValue({
      client: null,
      isConnected: false,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it("should parse and display valid JSON messages", () => {
    const validMessages = [
      JSON.stringify({ message: "Hello World", timestamp: "2023-01-01T00:00:00Z" }),
      JSON.stringify({ message: "Test Message", timestamp: "2023-01-01T00:01:00Z" })
    ];

    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: validMessages,
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("should filter out invalid JSON messages", () => {
    const mixedMessages = [
      JSON.stringify({ message: "Valid Message", timestamp: "2023-01-01T00:00:00Z" }),
      "Invalid JSON message",
      JSON.stringify({ message: "Another Valid", timestamp: "2023-01-01T00:01:00Z" })
    ];

    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: mixedMessages,
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(screen.getByText("Valid Message")).toBeInTheDocument();
    expect(screen.getByText("Another Valid")).toBeInTheDocument();
    expect(screen.queryByText("Invalid JSON message")).not.toBeInTheDocument();
  });

  it("should handle messages without message property", () => {
    const invalidMessages = [
      JSON.stringify({ timestamp: "2023-01-01T00:00:00Z" }),
      JSON.stringify({ message: "Valid Message", timestamp: "2023-01-01T00:01:00Z" })
    ];

    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: invalidMessages,
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    expect(screen.getByText("Valid Message")).toBeInTheDocument();
    expect(screen.queryByText("Invalid JSON message")).not.toBeInTheDocument();
  });

  it("should publish message with correct format", async () => {
    const user = userEvent.setup();
    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    render(<App />);

    const input = screen.getByLabelText("Message:");
    await user.type(input, "Test Message");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(mockPublish).toHaveBeenCalledWith("psu/drone", expect.stringContaining("Test Message"));

    const publishedMessage = mockPublish.mock.calls[0][1];
    const parsedMessage = JSON.parse(publishedMessage);
    expect(parsedMessage).toHaveProperty("message", "Test Message");
    expect(parsedMessage).toHaveProperty("timestamp");
  });

  it("should show alert with correct variant based on connection status", () => {
    // Test when connected
    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    const { rerender } = render(<App />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert-success");

    // Test when not connected
    mockUseMqtt.mockReturnValue({
      client: null,
      isConnected: false,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    rerender(<App />);

    const alertDisconnected = screen.getByRole("alert");
    expect(alertDisconnected).toHaveClass("alert-danger");
  });

  it("should only subscribe once when connection status changes", () => {
    const { rerender } = render(<App />);

    // Initially not connected
    mockUseMqtt.mockReturnValue({
      client: null,
      isConnected: false,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    expect(mockSubscribe).not.toHaveBeenCalled();

    // Then connected
    mockUseMqtt.mockReturnValue({
      client: {},
      isConnected: true,
      messages: [],
      subscribe: mockSubscribe,
      publish: mockPublish,
      disconnect: jest.fn()
    });

    rerender(<App />);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith("psu/drone");
  });
});
