const mockUseMqtt = jest.fn();
jest.mock("../hooks/useMqtt", () => ({
  __esModule: true,
  default: mockUseMqtt
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// KHÔNG import mockUseMqtt từ test-utils!

describe("App Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete MQTT Flow", () => {
    it("should handle complete message flow", async () => {
      const mockSubscribe = jest.fn();
      const mockPublish = jest.fn();

      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: ['{"message": "Hello World", "timestamp": "2024-01-01T00:00:00Z"}'],
        subscribe: mockSubscribe,
        publish: mockPublish,
        disconnect: jest.fn()
      });

      render(<App />);

      // Check connection status
      expect(screen.getByText(/MQTT is\s+connected/i)).toBeInTheDocument();

      // Check message display
      expect(screen.getByText("Hello World")).toBeInTheDocument();
      // Không kiểm tra timestamp vì UI không render timestamp

      // Test publishing
      const input = screen.getByLabelText("Message:");
      const button = screen.getByRole("button", { name: /send message/i });

      await userEvent.type(input, "Test message");
      await userEvent.click(button);

      // Kiểm tra publish đúng topic và message là JSON chứa Test message
      expect(mockPublish).toHaveBeenCalledWith("psu/drone", expect.stringContaining("Test message"));
    });

    it("should handle connection loss and reconnection", async () => {
      const mockSubscribe = jest.fn();

      // Start disconnected
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: false,
        messages: [],
        subscribe: mockSubscribe,
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      const { rerender } = render(<App />);

      expect(screen.getByText(/MQTT is\s+not connected/i)).toBeInTheDocument();
      expect(mockSubscribe).toHaveBeenCalledTimes(0); // Not called when disconnected

      // Simulate reconnection
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: mockSubscribe,
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      rerender(<App />);

      expect(screen.getByText(/MQTT is\s+connected/i)).toBeInTheDocument();
      expect(mockSubscribe).toHaveBeenCalledTimes(1); // Called once when connected
    });
  });

  describe("Message Handling", () => {
    it("should handle mixed valid and invalid messages", () => {
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [
          '{"message": "Valid message", "timestamp": "2024-01-01T00:00:00Z"}',
          "Invalid JSON message",
          '{"message": "Another valid", "timestamp": "2024-01-01T00:00:01Z"}',
          '{"invalid": "no message property"}'
        ],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      render(<App />);

      // Should only show valid messages
      expect(screen.getByText("Valid message")).toBeInTheDocument();
      expect(screen.getByText("Another valid")).toBeInTheDocument();
      expect(screen.queryByText("Invalid JSON message")).not.toBeInTheDocument();
    });

    it("should handle empty message list", () => {
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      render(<App />);

      expect(screen.getByText("No messages received yet...")).toBeInTheDocument();
    });
  });

  describe("UI State Management", () => {
    it("should disable input and button when not connected", () => {
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: false,
        messages: [],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      render(<App />);

      const input = screen.getByLabelText("Message:");
      const button = screen.getByRole("button", { name: /send message/i });

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it("should enable input and button when connected", async () => {
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      render(<App />);

      const input = screen.getByLabelText("Message:");
      const button = screen.getByRole("button", { name: /send message/i });

      // Gõ text để button enable
      await userEvent.type(input, "abc");
      expect(input).toBeEnabled();
      expect(button).toBeEnabled();
    });

    it("should show correct alert styling based on connection status", () => {
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      const { rerender } = render(<App />);

      // Connected state
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("alert-success");

      // Disconnected state
      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: false,
        messages: [],
        subscribe: jest.fn(),
        publish: jest.fn(),
        disconnect: jest.fn()
      });

      rerender(<App />);

      const alert2 = screen.getByRole("alert");
      expect(alert2).toHaveClass("alert-danger");
    });
  });

  describe("User Interaction", () => {
    it("should handle form submission and input clearing", async () => {
      const mockPublish = jest.fn();

      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: mockPublish,
        disconnect: jest.fn()
      });

      render(<App />);

      const input = screen.getByLabelText("Message:");
      const button = screen.getByRole("button", { name: /send message/i });

      await userEvent.type(input, "Test message");
      await userEvent.click(button);

      // Kiểm tra publish đúng topic và message là JSON chứa Test message
      expect(mockPublish).toHaveBeenCalledWith("psu/drone", expect.stringContaining("Test message"));
      expect(input).toHaveValue("");
    });

    it("should handle Enter key submission", async () => {
      const mockPublish = jest.fn();

      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: mockPublish,
        disconnect: jest.fn()
      });

      render(<App />);

      const input = screen.getByLabelText("Message:");

      await userEvent.type(input, "Test message{enter}");

      expect(mockPublish).toHaveBeenCalledWith("psu/drone", expect.stringContaining("Test message"));
    });

    it("should not submit empty messages", async () => {
      const mockPublish = jest.fn();

      mockUseMqtt.mockReturnValue({
        client: {},
        isConnected: true,
        messages: [],
        subscribe: jest.fn(),
        publish: mockPublish,
        disconnect: jest.fn()
      });

      render(<App />);

      const button = screen.getByRole("button", { name: /send message/i });

      await userEvent.click(button);

      expect(mockPublish).not.toHaveBeenCalled();
    });
  });
});

