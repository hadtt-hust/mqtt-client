# MQTT Hook Usage Guide

## 🚀 Cách sử dụng hook useMqtt

### 1. **Cấu hình cơ bản**

Hook `useMqtt` yêu cầu một object `MqttBrokerConfig` với `host` là bắt buộc:

```typescript
import useMqtt from "./hooks/useMqtt";

function MyComponent() {
  const { client, isConnected, messages, subscribe, publish } = useMqtt({
    host: "192.168.1.100", // ⚠️ BẮT BUỘC
    port: 1883, // Optional (default: 1883)
    path: "/mqtt", // Optional (default: "/mqtt")
    useSSL: false, // Optional (default: false)
    username: "admin", // Optional
    password: "password123", // Optional
    clientId: "my-client" // Optional (auto-generated nếu không có)
  });

  return (
    <div>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Messages: {messages.length}</p>
    </div>
  );
}
```

### 2. **Sử dụng preset configurations**

#### **HiveMQ Public Broker (để test)**

```typescript
import { brokerPresets } from "./config/mqtt-config";

function TestComponent() {
  const { isConnected, messages, subscribe, publish } = useMqtt(brokerPresets.hivemq);

  // Không cần username/password
  return <div>Testing with HiveMQ...</div>;
}
```

#### **Mosquitto Local**

```typescript
import { brokerPresets } from "./config/mqtt-config";

function LocalComponent() {
  const { isConnected, messages, subscribe, publish } = useMqtt(brokerPresets.mosquitto);

  // Kết nối đến localhost:1883
  return <div>Local Mosquitto...</div>;
}
```

#### **Mosquitto với Authentication**

```typescript
import { brokerPresets } from "./config/mqtt-config";

function AuthComponent() {
  const { isConnected, messages, subscribe, publish } = useMqtt({
    ...brokerPresets.mosquittoAuth,
    host: "192.168.1.100", // Thay đổi IP
    username: "admin", // Thay đổi username
    password: "password123" // Thay đổi password
  });

  return <div>Authenticated connection...</div>;
}
```

### 3. **Sử dụng helper function**

#### **Tạo cấu hình nhanh**

```typescript
import { createMqttConfig } from "./config/mqtt-config";

function CustomComponent() {
  const config = createMqttConfig("192.168.1.100", {
    port: 1883,
    username: "admin",
    password: "password123",
    useSSL: false
  });

  const { isConnected, messages, subscribe, publish } = useMqtt(config);

  return <div>Custom configuration...</div>;
}
```

#### **Inline configuration**

```typescript
import { createMqttConfig } from "./config/mqtt-config";

function InlineComponent() {
  const { isConnected, messages, subscribe, publish } = useMqtt(
    createMqttConfig("192.168.1.100", {
      username: "admin",
      password: "password123"
    })
  );

  return <div>Inline config...</div>;
}
```

### 4. **Các operations cơ bản**

#### **Subscribe to topics**

```typescript
useEffect(() => {
  if (isConnected) {
    subscribe("sensor/temperature");
    subscribe("device/status");
    subscribe("user/notifications");
  }
}, [isConnected, subscribe]);
```

#### **Publish messages**

```typescript
const handleSendMessage = () => {
  const message = JSON.stringify({
    message: "Hello MQTT!",
    timestamp: new Date().toISOString()
  });

  publish("test/topic", message);
};

const handleControlDevice = () => {
  const command = JSON.stringify({
    command: "turn_on",
    device: "led_1",
    timestamp: new Date().toISOString()
  });

  publish("device/control", command);
};
```

#### **Handle incoming messages**

```typescript
useEffect(() => {
  // messages array chứa tất cả messages nhận được
  console.log("Received messages:", messages);

  // Parse messages
  const parsedMessages = messages.map(msg => {
    try {
      return JSON.parse(msg);
    } catch {
      return { message: msg, timestamp: new Date().toISOString() };
    }
  });

  console.log("Parsed messages:", parsedMessages);
}, [messages]);
```

### 5. **Error handling**

#### **Connection errors**

```typescript
function RobustComponent() {
  const [error, setError] = useState<string | null>(null);

  const { isConnected, messages, subscribe, publish } = useMqtt({
    host: "192.168.1.100",
    port: 1883,
    username: "admin",
    password: "password123"
  });

  useEffect(() => {
    if (!isConnected) {
      setError("Failed to connect to MQTT broker");
    } else {
      setError(null);
    }
  }, [isConnected]);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return <div>Connected successfully!</div>;
}
```

#### **Validation errors**

```typescript
function ValidatedComponent() {
  try {
    const { isConnected, messages, subscribe, publish } = useMqtt({
      // host: "192.168.1.100", // ❌ Sẽ throw error vì thiếu host
    });

    return <div>Valid configuration</div>;
  } catch (error) {
    return <div className="error">Configuration error: {error.message}</div>;
  }
}
```

### 6. **Advanced usage**

#### **Multiple MQTT connections**

```typescript
function MultiConnectionComponent() {
  // Connection 1: Local broker
  const localMqtt = useMqtt({
    host: "192.168.1.100",
    port: 1883,
    username: "admin",
    password: "password123"
  });

  // Connection 2: Cloud broker
  const cloudMqtt = useMqtt({
    host: "broker.hivemq.com",
    port: 8000,
    path: "/mqtt"
  });

  return (
    <div>
      <div>Local: {localMqtt.isConnected ? "Connected" : "Disconnected"}</div>
      <div>Cloud: {cloudMqtt.isConnected ? "Connected" : "Disconnected"}</div>
    </div>
  );
}
```

#### **Conditional connection**

```typescript
function ConditionalComponent() {
  const [useLocal, setUseLocal] = useState(true);

  const config = useLocal
    ? { host: "192.168.1.100", port: 1883, username: "admin", password: "password123" }
    : { host: "broker.hivemq.com", port: 8000, path: "/mqtt" };

  const { isConnected, messages, subscribe, publish } = useMqtt(config);

  return (
    <div>
      <button onClick={() => setUseLocal(!useLocal)}>Switch to {useLocal ? "Cloud" : "Local"}</button>
      <div>Connected: {isConnected ? "Yes" : "No"}</div>
    </div>
  );
}
```

### 7. **Best practices**

#### **✅ Good practices**

```typescript
// ✅ Sử dụng preset cho development
const { isConnected } = useMqtt(brokerPresets.hivemq);

// ✅ Validate configuration
if (!host) {
  throw new Error("MQTT host is required");
}

// ✅ Handle connection state
useEffect(() => {
  if (isConnected) {
    subscribe("important/topic");
  }
}, [isConnected, subscribe]);

// ✅ Clean up subscriptions
useEffect(() => {
  return () => {
    // Hook tự động cleanup khi unmount
  };
}, []);
```

#### **❌ Avoid these**

```typescript
// ❌ Không hardcode credentials
const { isConnected } = useMqtt({
  host: "192.168.1.100",
  username: "admin",
  password: "password123" // Hardcoded password
});

// ❌ Không tạo connection trong render
const config = { host: "192.168.1.100" };
const { isConnected } = useMqtt(config); // Config được tạo mỗi render

// ❌ Không ignore connection state
const { publish } = useMqtt(config);
publish("topic", "message"); // Không kiểm tra isConnected
```

### 8. **Troubleshooting**

#### **Common issues**

```typescript
// Issue 1: Connection timeout
// Solution: Kiểm tra network và firewall
const config = {
  host: "192.168.1.100",
  port: 1883,
  timeout: 30 // Tăng timeout
};

// Issue 2: Authentication failed
// Solution: Kiểm tra username/password
const config = {
  host: "192.168.1.100",
  username: "correct_username",
  password: "correct_password"
};

// Issue 3: SSL certificate error
// Solution: Sử dụng useSSL: false hoặc fix certificate
const config = {
  host: "192.168.1.100",
  port: 8883,
  useSSL: true // Đảm bảo certificate đúng
};
```

---

**Lưu ý**: Luôn đảm bảo thay đổi placeholder values (`YOUR_BROKER_IP`, `YOUR_USERNAME`, `YOUR_PASSWORD`) thành giá trị thực tế của bạn! 🔐
