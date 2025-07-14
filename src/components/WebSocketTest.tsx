import React, { useState } from "react";
import { Button, Alert, Card, Form, Row, Col } from "react-bootstrap";

interface WebSocketTestProps {}

const WebSocketTest: React.FC<WebSocketTestProps> = () => {
  const [config, setConfig] = useState({
    host: "localhost",
    port: 9001,
    path: "/",
    useSSL: false
  });
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const testWebSocket = () => {
    setStatus("testing");
    setError(null);

    try {
      const protocol = config.useSSL ? "wss" : "ws";
      const url = `${protocol}://${config.host}:${config.port}${config.path}`;

      console.log("🔗 Testing WebSocket connection to:", url);

      const websocket = new WebSocket(url);

      websocket.onopen = () => {
        console.log("✅ WebSocket connection opened successfully");
        setStatus("success");
        setWs(websocket);

        // Close connection after test
        setTimeout(() => {
          websocket.close();
        }, 2000);
      };

      websocket.onerror = event => {
        console.error("❌ WebSocket connection failed:", event);
        setStatus("error");
        setError("WebSocket connection failed. Check host, port, and path.");
      };

      websocket.onclose = event => {
        console.log("🔌 WebSocket connection closed:", event.code, event.reason);
        setWs(null);
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (websocket.readyState === WebSocket.CONNECTING) {
          websocket.close();
          setStatus("error");
          setError("Connection timeout after 10 seconds");
        }
      }, 10000);
    } catch (err) {
      console.error("❌ WebSocket test error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const stopTest = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setStatus("idle");
    setError(null);
  };

  return (
    <Card className="mb-3">
      <Card.Header>WebSocket Connection Test</Card.Header>
      <Card.Body>
        <p className="text-muted">
          Test WebSocket connection before trying MQTT. This helps identify if the issue is with WebSocket or MQTT
          protocol.
        </p>

        <Row>
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Port</Form.Label>
              <Form.Control
                type="number"
                value={config.port}
                onChange={e => setConfig({ ...config, port: parseInt(e.target.value) })}
                placeholder="9001"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Use SSL (WSS)"
                checked={config.useSSL}
                onChange={e => setConfig({ ...config, useSSL: e.target.checked })}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-2 mb-3">
          <Button onClick={testWebSocket} disabled={status === "testing"} variant="primary">
            {status === "testing" ? "Testing..." : "Test WebSocket"}
          </Button>

          {status === "testing" && (
            <Button onClick={stopTest} variant="outline-secondary">
              Stop Test
            </Button>
          )}
        </div>

        {status === "success" && (
          <Alert variant="success">
            <strong>✅ WebSocket connection successful!</strong>
            <br />
            The WebSocket endpoint is working. If MQTT still fails, the issue is with MQTT protocol configuration.
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="danger">
            <strong>❌ WebSocket connection failed!</strong>
            <br />
            {error}
            <br />
            <strong>Common solutions:</strong>
            <ul className="mb-0 mt-2">
              <li>Check if WebSocket port is correct (9001, 8083, 8084)</li>
              <li>Try different paths: "/", "/mqtt", "/ws"</li>
              <li>Check if broker supports WebSocket</li>
              <li>Check firewall settings</li>
            </ul>
          </Alert>
        )}

        <div className="mt-3">
          <h6>Common WebSocket configurations:</h6>
          <div className="row">
            <div className="col-md-6">
              <strong>Mosquitto:</strong>
              <ul className="small">
                <li>Port: 9001</li>
                <li>Path: /</li>
                <li>Protocol: WS</li>
              </ul>
            </div>
            <div className="col-md-6">
              <strong>HiveMQ:</strong>
              <ul className="small">
                <li>Port: 8000</li>
                <li>Path: /mqtt</li>
                <li>Protocol: WS</li>
              </ul>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WebSocketTest;
