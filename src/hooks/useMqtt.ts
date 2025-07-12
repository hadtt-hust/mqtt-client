import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Client, Message } from "paho-mqtt";
import { MqttBrokerConfig, UseMqttReturn, MqttConnectionResponse, MqttMessage } from "../types/mqtt";

const useMqtt = (brokerConfig: MqttBrokerConfig = {}): UseMqttReturn => {
  const {
    host = "broker.hivemq.com",
    port = 8000,
    path = "/mqtt",
    clientId: providedClientId,
    useSSL = false,
    username,
    password
  } = brokerConfig;

  // Tạo clientId cố định để tránh re-render
  const clientId = useMemo(() => {
    return providedClientId || "pahojs_" + Math.random().toString(16).substring(2, 10);
  }, [providedClientId]);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);
  const connectingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const initializedRef = useRef<boolean>(false);

  // Tạo client MQTT - chỉ chạy một lần khi component mount
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    clientRef.current = new Client(host, port, path, clientId);
    const client = clientRef.current;

    // Xử lý mất kết nối
    client.onConnectionLost = (responseObject: MqttConnectionResponse) => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      connectingRef.current = false;
      if (responseObject.errorCode !== 0) {
        console.error("🔌 MQTT Connection lost:", responseObject.errorMessage);
      }
    };

    // Xử lý nhận message
    client.onMessageArrived = (message: MqttMessage) => {
      console.log("📨 Message arrived:", message.destinationName, message.payloadString);
      setMessages(prevMessages => [message.payloadString, ...prevMessages]);
    };

    // Kết nối
    connectingRef.current = true;

    client.connect({
      onSuccess: () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        connectingRef.current = false;
        console.log("✅ Connected to MQTT broker");
      },
      onFailure: (err: MqttConnectionResponse) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        connectingRef.current = false;
        console.error("❌ MQTT Connection error:", err.errorMessage);
      },
      useSSL,
      userName: username,
      password: password
    });

    // Cleanup khi unmount
    return () => {
      mountedRef.current = false;
      connectingRef.current = false;
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []); // Empty dependencies - chỉ chạy một lần

  // Subscribe to topic
  const subscribe = useCallback((topic: string): void => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.subscribe(topic);
      console.log("📡 Subscribed to:", topic);
    }
  }, []);

  // Publish message
  const publish = useCallback((topic: string, message: string): void => {
    if (clientRef.current?.isConnected()) {
      const mqttMsg = new Message(message);
      mqttMsg.destinationName = topic;
      clientRef.current.send(mqttMsg);
      console.log("📤 Published to:", topic, message);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback((): void => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.disconnect();
    }
  }, []);

  return {
    client: clientRef.current,
    isConnected,
    messages,
    subscribe,
    publish,
    disconnect
  };
};

export default useMqtt;

