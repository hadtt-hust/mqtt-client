import React, { useEffect, useState, useRef } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import MqttTest from "./components/MqttTest";
import MqttDebug from "./components/MqttDebug";
import WebSocketTest from "./components/WebSocketTest";
import useMqtt from "./hooks/useMqtt";
import { ParsedMessage } from "./types/mqtt";
import { mqttTopics, messageConfig } from "./config/mqtt-config";

const App: React.FC = () => {
  const routingKey: string = mqttTopics.default;
  const [parsedMessages, setParsedMessages] = useState<string[]>([]);
  const subscribedRef = useRef<boolean>(false);

  // Sử dụng MQTT hook với cấu hình broker
  const { isConnected, isRetrying, retryCount, maxRetries, messages, subscribe, publish } = useMqtt({
    host: "192.168.1.100", // ← Thay đổi thành IP EMQX thực tế của bạn
    port: 8083, // ← Thay đổi thành WebSocket port thực tế (8083, 8084, 9001)
    path: "/mqtt", // ← Thay đổi thành path WebSocket thực tế (/mqtt, /ws, /)
    useSSL: false, // ← true nếu dùng WSS
    username: "", // ← Để trống nếu không cần auth, hoặc nhập username thực tế
    password: "" // ← Để trống nếu không cần auth, hoặc nhập password thực tế
  });

  // Subscribe khi kết nối thành công - chỉ một lần
  useEffect(() => {
    if (isConnected && !subscribedRef.current) {
      subscribe(routingKey);
      subscribedRef.current = true;
    }
  }, [isConnected, subscribe, routingKey]);

  // Parse messages từ MQTT hook
  useEffect(() => {
    const newMessages = messages
      .filter((msg: string) => {
        try {
          const json: ParsedMessage = JSON.parse(msg);
          return json.message; // Chỉ lấy message có format đúng
        } catch {
          return false;
        }
      })
      .map((msg: string) => {
        try {
          const json: ParsedMessage = JSON.parse(msg);
          return json.message;
        } catch {
          return msg;
        }
      });

    setParsedMessages(newMessages);
  }, [messages]);

  const handlePublish = (message: string): void => {
    const mqttMessage = JSON.stringify(messageConfig.formatMessage(message));
    publish(routingKey, mqttMessage);
  };

  return (
    <>
      <Header />
      <main className="mt-3">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Alert variant={isConnected ? "success" : isRetrying ? "warning" : "danger"}>
                <Alert.Heading>
                  MQTT is {isConnected ? "connected" : isRetrying ? "retrying connection" : "not connected"}
                </Alert.Heading>
                {isRetrying && (
                  <p className="mb-0">
                    Retrying connection... (Attempt {retryCount + 1}/{maxRetries + 1})
                  </p>
                )}
              </Alert>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={8}>
              <MqttTest isConnected={isConnected} onPublish={handlePublish} />
            </Col>
          </Row>

          {/* WebSocket Test - Test WebSocket connection first */}
          <Row className="justify-content-center">
            <Col lg={12}>
              <WebSocketTest />
            </Col>
          </Row>

          {/* Debug Component - Comment out when not needed */}
          <Row className="justify-content-center">
            <Col lg={12}>
              <MqttDebug />
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={12} className="text-center">
              <h2>MQTT Messages</h2>
            </Col>
            <Col lg={10}>
              <div className="pre-scrollable overflow-auto p-3" style={{ backgroundColor: "#d3d3d3" }}>
                {parsedMessages.length > 0 ? (
                  parsedMessages.map((msg: string, idx: number) => (
                    <div key={`message-${idx}-${msg.substring(0, 10)}`}>
                      <p>{msg}</p>
                      <hr />
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No messages received yet...</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default App;

