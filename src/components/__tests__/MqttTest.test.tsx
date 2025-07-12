import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MqttTest from "../MqttTest";

describe("MqttTest", () => {
  const mockOnPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    expect(screen.getByText("MQTT Test Panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Message:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("should be enabled when connected", () => {
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");
    const button = screen.getByRole("button", { name: /send message/i });

    expect(input).toBeEnabled();
    // Button is disabled when message is empty, which is correct behavior
    expect(button).toBeDisabled();
  });

  it("should be disabled when not connected", () => {
    render(<MqttTest isConnected={false} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");
    const button = screen.getByRole("button", { name: /send message/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("should call onPublish when form is submitted", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");
    const button = screen.getByRole("button", { name: /send message/i });

    await user.type(input, "test message");
    await user.click(button);

    expect(mockOnPublish).toHaveBeenCalledWith("test message");
  });

  it("should call onPublish when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");

    await user.type(input, "test message{enter}");

    expect(mockOnPublish).toHaveBeenCalledWith("test message");
  });

  it("should clear input after sending message", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:") as HTMLInputElement;

    await user.type(input, "test message");
    expect(input.value).toBe("test message");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("should not call onPublish when message is empty", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const button = screen.getByRole("button", { name: /send message/i });

    await user.click(button);

    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it("should not call onPublish when message is only whitespace", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");
    const button = screen.getByRole("button", { name: /send message/i });

    await user.type(input, "   ");
    await user.click(button);

    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it("should disable send button when message is empty", () => {
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const button = screen.getByRole("button", { name: /send message/i });
    expect(button).toBeDisabled();
  });

  it("should enable send button when message is not empty", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");
    const button = screen.getByRole("button", { name: /send message/i });

    expect(button).toBeDisabled();

    await user.type(input, "test message");

    expect(button).toBeEnabled();
  });

  it("should handle multiple messages", async () => {
    const user = userEvent.setup();
    render(<MqttTest isConnected={true} onPublish={mockOnPublish} />);

    const input = screen.getByLabelText("Message:");

    await user.type(input, "first message{enter}");
    await user.type(input, "second message{enter}");

    expect(mockOnPublish).toHaveBeenCalledTimes(2);
    expect(mockOnPublish).toHaveBeenNthCalledWith(1, "first message");
    expect(mockOnPublish).toHaveBeenNthCalledWith(2, "second message");
  });
});

