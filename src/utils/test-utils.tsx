import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

// Mock useMqtt hook for testing
const mockUseMqtt = jest.fn();

// Mock the useMqtt hook
jest.mock("../hooks/useMqtt", () => ({
  __esModule: true,
  default: mockUseMqtt
}));

// Custom render function with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => render(ui, { ...options });

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Export mock function
export { mockUseMqtt };

// Test data helpers
export const createMockMqttConfig = (overrides = {}) => ({
  host: "test.broker.com",
  port: 8883,
  path: "/ws",
  clientId: "test-client",
  useSSL: true,
  ...overrides
});

export const createMockMqttReturn = (overrides = {}) => ({
  client: {},
  isConnected: false,
  messages: [],
  subscribe: jest.fn(),
  publish: jest.fn(),
  disconnect: jest.fn(),
  ...overrides
});

export const createMockMessage = (message: string, timestamp?: string) =>
  JSON.stringify({
    message,
    timestamp: timestamp || new Date().toISOString()
  });

export const createMockMqttMessage = (overrides = {}) => ({
  destinationName: "test/topic",
  payloadString: "test message",
  payloadBytes: new Uint8Array([1, 2, 3]),
  qos: 0,
  retained: false,
  duplicate: false,
  ...overrides
});

export const createMockConnectionResponse = (overrides = {}) => ({
  errorCode: 0,
  errorMessage: "Success",
  ...overrides
});
