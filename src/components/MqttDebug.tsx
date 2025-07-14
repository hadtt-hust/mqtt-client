import React, { useState } from "react";
import { Button, Form, Alert, Card, Row, Col } from "react-bootstrap";
import useMqtt from "../hooks/useMqtt";
import { createMqttConfig } from "../config/mqtt-config";

interface MqttDebugProps {}

const MqttDebug: React.FC<MqttDebugProps> = () => {
  const [config, setConfig] = useState({
    host: "localhost",
    port: 9001,
    path: "/",
    useSSL: false,
    username: "",
    password: ""
  });

  const [testConfig, setTestConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { client, isConnected, messages, subscribe, publish, disconnect } = useMqtt(
    testConfig || { host: "localhost", port: 9001, path: "/" }
  );

  const handleTestConnection = () => {
    setError(null);
    try {
      const newConfig = createMqttConfig(config.host, {
        port: config.port,
        path: config.path,
        useSSL: config.useSSL,
        username: config.username || undefined,
        password: config.password || undefined
      });
      setTestConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handlePublish = () => {
    if (isConnected) {
      const message = JSON.stringify({
        message: "Test message from React app",
        timestamp: new Date().toISOString()
      });
      publish("test/topic", message);
    }
  };

  const handleSubscribe = () => {
    if (isConnected) {
      subscribe("test/topic");
    }
  };

  return (
    <div className="mt-4">
      <h3>MQTT Connection Debug</h3>

      <Card className="mb-3">
        <Card.Header>Connection Configuration</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Host</Form.Label>
                <Form.Control
                  type="text"
                  value={config.host}
                  onChange={e => setConfig({ ...config, host: e.target.value })}
                  placeholder="localhost"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Port</Form.Label>
                <Form.Control
                  type="number"
                  value={config.port}
                  onChange={e => setConfig({ ...config, port: parseInt(e.target.value) })}
                  placeholder="9001"
                />
                <Form.Text className="text-muted">
                  Use 9001 for WebSocket, 1883 for TCP (not supported in browser)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Path</Form.Label>
                <Form.Control
                  type="text"
                  value={config.path}
                  onChange={e => setConfig({ ...config, path: e.target.value })}
                  placeholder="/"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Use SSL"
                  checked={config.useSSL}
                  onChange={e => setConfig({ ...config, useSSL: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Username (optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={config.username}
                  onChange={e => setConfig({ ...config, username: e.target.value })}
                  placeholder="admin"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password (optional)</Form.Label>
                <Form.Control
                  type="password"
                  value={config.password}
                  onChange={e => setConfig({ ...config, password: e.target.value })}
                  placeholder="password123"
                />
              </Form.Group>
            </Col>
          </Row>

          <Button onClick={handleTestConnection} variant="primary">
            Test Connection
          </Button>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger">
          <strong>Configuration Error:</strong> {error}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Header>Connection Status</Card.Header>
        <Card.Body>
          <Alert variant={isConnected ? "success" : "danger"}>
            <strong>Status:</strong> {isConnected ? "Connected" : "Disconnected"}
          </Alert>

          {testConfig && (
            <div>
              <p>
                <strong>Current Config:</strong>
              </p>
              <pre className="bg-light p-2 rounded">{JSON.stringify(testConfig, null, 2)}</pre>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>MQTT Operations</Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 mb-3">
            <Button onClick={handleSubscribe} disabled={!isConnected} variant="outline-primary">
              Subscribe to test/topic
            </Button>
            <Button onClick={handlePublish} disabled={!isConnected} variant="outline-success">
              Publish Test Message
            </Button>
            <Button onClick={disconnect} disabled={!isConnected} variant="outline-danger">
              Disconnect
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Received Messages ({messages.length})</Card.Header>
        <Card.Body>
          {messages.length > 0 ? (
            <div className="max-height-300 overflow-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className="border-bottom pb-2 mb-2">
                  <small className="text-muted">Message {idx + 1}:</small>
                  <pre className="bg-light p-2 rounded mt-1">{msg}</pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No messages received yet...</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MqttDebug;
