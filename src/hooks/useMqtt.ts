import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Client, Message } from "paho-mqtt";
import { MqttBrokerConfig, UseMqttReturn, MqttConnectionResponse, MqttMessage } from "../types/mqtt";

const useMqtt = (brokerConfig: MqttBrokerConfig): UseMqttReturn => {
  const {
    host,
    port = 1883,
    path = "/mqtt",
    clientId: providedClientId,
    useSSL = false,
    username,
    password
  } = brokerConfig;

  // Validate required fields
  if (!host) {
    throw new Error("MQTT host is required");
  }

  // Tạo clientId cố định để tránh re-render
  const clientId = useMemo(() => {
    return providedClientId || "pahojs_" + Math.random().toString(16).substring(2, 10);
  }, [providedClientId]);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const clientRef = useRef<Client | null>(null);
  const connectingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const initializedRef = useRef<boolean>(false);

  // Retry configuration
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds

  // Hàm kết nối MQTT với retry logic
  const connectMqtt = useCallback(() => {
    if (connectingRef.current || !mountedRef.current) {
      return;
    }

    connectingRef.current = true;
    setIsRetrying(retryCount > 0);

    console.log(`🔗 Attempting to connect to MQTT broker (attempt ${retryCount + 1}/${maxRetries + 1}):`, {
      host,
      port,
      path,
      useSSL,
      username: username ? "***" : "none",
      password: password ? "***" : "none"
    });

    // Tạo client mới mỗi lần retry
    clientRef.current = new Client(host, port, path, clientId);
    const client = clientRef.current;

    // Xử lý mất kết nối
    client.onConnectionLost = (responseObject: MqttConnectionResponse) => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      connectingRef.current = false;
      if (responseObject.errorCode !== 0) {
        console.error("🔌 MQTT Connection lost:", responseObject.errorMessage);

        // Tự động reconnect khi mất kết nối (nếu đã kết nối thành công trước đó)
        if (retryCount === 0) {
          console.log("🔄 Auto-reconnecting after connection lost...");
          setTimeout(() => {
            if (mountedRef.current) {
              setRetryCount(1);
              connectMqtt();
            }
          }, retryDelay);
        }
      }
    };

    // Xử lý nhận message
    client.onMessageArrived = (message: MqttMessage) => {
      console.log("📨 Message arrived:", message.destinationName, message.payloadString);
      setMessages(prevMessages => [message.payloadString, ...prevMessages]);
    };

    // Kết nối
    client.connect({
      onSuccess: () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setIsRetrying(false);
        setRetryCount(0); // Reset retry count khi thành công
        connectingRef.current = false;
        console.log("✅ Connected to MQTT broker successfully");
      },
      onFailure: (err: MqttConnectionResponse) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        connectingRef.current = false;
        console.error("❌ MQTT Connection failed:", {
          errorCode: err.errorCode,
          errorMessage: err.errorMessage,
          config: { host, port, path, useSSL },
          attempt: retryCount + 1,
          maxRetries
        });

        // Log chi tiết hơn cho error code 7
        if (err.errorCode === 7) {
          console.error("🔍 Error Code 7 - CONNECTION_LOST details:");
          console.error("- Check WebSocket path (try '/' instead of '/mqtt')");
          console.error("- Check WebSocket port (common: 9001, 8083, 8084)");
          console.error("- Check if broker supports WebSocket");
          console.error("- Check CORS settings on broker");
          console.error("- Check network/firewall");
        }

        // Retry logic
        if (retryCount < maxRetries && mountedRef.current) {
          console.log(`🔄 Retrying connection in ${retryDelay / 1000} seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            if (mountedRef.current) {
              setRetryCount(prev => prev + 1);
              connectMqtt();
            }
          }, retryDelay);
        } else if (retryCount >= maxRetries) {
          console.error("❌ Max retries reached. Giving up connection attempts.");
          setIsRetrying(false);
        }
      },
      useSSL,
      userName: username,
      password: password,
      timeout: 30, // 30 seconds timeout
      keepAliveInterval: 60 // 60 seconds keep-alive
    });
  }, [host, port, path, clientId, useSSL, username, password, retryCount, maxRetries, retryDelay]);

  // Tạo client MQTT - chỉ chạy một lần khi component mount
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    connectMqtt();

    // Cleanup khi unmount
    return () => {
      mountedRef.current = false;
      connectingRef.current = false;
      if (clientRef.current?.isConnected()) {
        clientRef.current.disconnect();
      }
    };
  }, [connectMqtt]); // Dependency vào connectMqtt function

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
    isRetrying,
    retryCount,
    maxRetries,
    messages,
    subscribe,
    publish,
    disconnect
  };
};

export default useMqtt;

