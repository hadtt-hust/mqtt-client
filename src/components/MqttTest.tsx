import React, { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { MqttTestProps } from "../types/mqtt";

const MqttTest: React.FC<MqttTestProps> = ({ isConnected, onPublish }) => {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onPublish(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h5>MQTT Test Panel</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="message-input">Message:</Form.Label>
            <Form.Control
              id="message-input"
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
              disabled={!isConnected}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={!isConnected || !message.trim()}>
            Send Message
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MqttTest;

