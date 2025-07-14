import React, { useEffect, useState, useRef } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import MqttTest from "./components/MqttTest";
import MqttDebug from "./components/MqttDebug";
import WebSocketTest from "./components/WebSocketTest";
import useMqtt from "./hooks/useMqtt";
import { ParsedMessage } from "./types/mqtt";
import { brokerPresets, createMqttConfig, mqttTopics, messageConfig } from "./config/mqtt-config";

const App: React.FC = () => {
  const routingKey: string = mqttTopics.default;
  const [parsedMessages, setParsedMessages] = useState<string[]>([]);
  const subscribedRef = useRef<boolean>(false);

  // Sử dụng MQTT hook với cấu hình broker
  // Chọn một trong các cách sau:

  // Cách 1: Sử dụng preset có sẵn (để test)
  // const { client, isConnected, messages, subscribe, publish } = useMqtt(brokerPresets.hivemq);

  // Cách 2: Sử dụng broker của bạn với WebSocket
  const { client, isConnected, messages, subscribe, publish } = useMqtt({
    host: "YOUR_BROKER_IP", // ← Thay đổi thành IP broker của bạn
    port: 9001, // ← Thay đổi thành WebSocket port của bạn
    path: "/", // ← Thay đổi thành path WebSocket của bạn
    useSSL: false, // ← true nếu dùng WSS
    username: "YOUR_USERNAME", // ← Thêm username nếu có
    password: "YOUR_PASSWORD" // ← Thêm password nếu có
  });

  // Cách 2: Tạo cấu hình tùy chỉnh
  // const { client, isConnected, messages, subscribe, publish } = useMqtt(
  //   createMqttConfig("192.168.1.100", {
  //     port: 1883,
  //     username: "admin",
  //     password: "password123"
  //   })
  // );

  // Cách 3: Sử dụng preset Mosquitto với auth
  // const { client, isConnected, messages, subscribe, publish } = useMqtt({
  //   ...brokerPresets.mosquittoAuth,
  //   host: "192.168.1.100", // Thay đổi IP
  //   username: "admin",     // Thay đổi username
  //   password: "password123" // Thay đổi password
  // });

  // Subscribe khi kết nối thành công - chỉ một lần
  useEffect(() => {
    if (isConnected && !subscribedRef.current) {
      subscribe(routingKey);
      subscribedRef.current = true;
    }
  }, [isConnected]); // Chỉ dependency vào isConnected

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
              <Alert variant={isConnected ? "success" : "danger"}>
                <Alert.Heading>MQTT is {isConnected ? "connected" : "not connected"}</Alert.Heading>
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
                    <div key={idx}>
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

